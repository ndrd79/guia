import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET /api/banners/slot/[slug] - Buscar banners ativos por slot slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Buscar slot pelo slug
    const { data: slot, error: slotError } = await supabase
      .from('banner_slots')
      .select('*')
      .eq('slug', params.slug)
      .eq('is_active', true)
      .single();

    if (slotError || !slot) {
      return NextResponse.json(
        { error: 'Slot não encontrado ou inativo' },
        { status: 404 }
      );
    }

    // Buscar template associado
    const { data: template, error: templateError } = await supabase
      .from('banner_templates')
      .select('*')
      .eq('id', slot.template_id)
      .eq('is_active', true)
      .single();

    if (templateError || !template) {
      return NextResponse.json(
        { error: 'Template não encontrado ou inativo' },
        { status: 404 }
      );
    }

    // Buscar banners ativos para este slot
    const now = new Date().toISOString();
    const { data: banners, error: bannersError } = await supabase
      .from('banners')
      .select(`
        id,
        title,
        image_url,
        link_url,
        position,
        start_date,
        end_date,
        is_active,
        click_count,
        priority,
        target_audience,
        created_at,
        companies!banners_company_id_fkey (
          id,
          name,
          logo_url
        )
      `)
      .eq('position', slot.id)
      .eq('is_active', true)
      .lte('start_date', now)
      .gte('end_date', now)
      .order('priority', { ascending: true })
      .limit(slot.max_banners || 10);

    if (bannersError) {
      console.error('Erro ao buscar banners:', bannersError);
      return NextResponse.json(
        { error: 'Erro ao buscar banners' },
        { status: 500 }
      );
    }

    // Formatar resposta
    const response = {
      slot: {
        id: slot.id,
        name: slot.name,
        slug: slot.slug,
        template: {
          id: template.id,
          name: template.name,
          type: template.type,
          config: template.config
        },
        config: {
          max_banners: slot.max_banners,
          rotation_time: slot.rotation_time,
          desktop_width: slot.desktop_width,
          desktop_height: slot.desktop_height,
          mobile_width: slot.mobile_width,
          mobile_height: slot.mobile_height,
          show_on_mobile: slot.show_on_mobile,
          analytics_enabled: slot.analytics_enabled,
          default_config: slot.default_config
        }
      },
      banners: banners?.map(banner => ({
        id: banner.id,
        title: banner.title,
        image_url: banner.image_url,
        link_url: banner.link_url,
        priority: banner.priority,
        company: banner.companies ? {
          id: banner.companies.id,
          name: banner.companies.name,
          logo_url: banner.companies.logo_url
        } : null
      })) || []
    };

    const etag = `slot-${slot.id}-${slot.updated_at}`;
    const ifNoneMatch = request.headers.get('if-none-match');
    if (ifNoneMatch === etag) {
      return new NextResponse(null, { status: 304, headers: { ETag: etag } });
    }
    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        ETag: etag
      }
    });

  } catch (error) {
    console.error('Erro na API de banners por slot:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/banners/slot/[slug]/track - Registrar evento de banner
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    const body = await request.json();
    const { banner_id, event_type, slot_id } = body;

    // Validar dados obrigatórios
    if (!banner_id || !event_type || !slot_id) {
      return NextResponse.json(
        { error: 'Campos obrigatórios: banner_id, event_type, slot_id' },
        { status: 400 }
      );
    }

    // Validar tipo de evento
    const validEvents = ['impression', 'click', 'view'];
    if (!validEvents.includes(event_type)) {
      return NextResponse.json(
        { error: 'Tipo de evento inválido. Use: impression, click, view' },
        { status: 400 }
      );
    }

    // Buscar slot para verificar se analytics está habilitado
    const { data: slot, error: slotError } = await supabase
      .from('banner_slots')
      .select('analytics_enabled')
      .eq('slug', params.slug)
      .single();

    if (slotError || !slot?.analytics_enabled) {
      return NextResponse.json(
        { error: 'Analytics desabilitado para este slot' },
        { status: 403 }
      );
    }

    // Buscar informações do banner
    const { data: banner, error: bannerError } = await supabase
      .from('banners')
      .select('id, title, company_id')
      .eq('id', banner_id)
      .single();

    if (bannerError || !banner) {
      return NextResponse.json(
        { error: 'Banner não encontrado' },
        { status: 404 }
      );
    }

    // Obter informações da requisição
    const userAgent = request.headers.get('user-agent') || '';
    const referrer = request.headers.get('referer') || '';
    const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown';

    // Registrar evento
    const { error: analyticsError } = await supabase
      .from('banner_analytics')
      .insert([{
        banner_id,
        slot_id,
        event_type,
        timestamp: new Date().toISOString(),
        user_agent: userAgent,
        referrer,
        page_url: referrer,
        ip_hash: ip // Em produção, use um hash do IP para privacidade
      }]);

    if (analyticsError) {
      console.error('Erro ao registrar analytics:', analyticsError);
      return NextResponse.json(
        { error: 'Erro ao registrar evento' },
        { status: 500 }
      );
    }

    // Atualizar contador de cliques se for um evento de clique
    if (event_type === 'click') {
      const { error: updateError } = await supabase
        .from('banners')
        .update({ 
          click_count: supabase.sql('click_count + 1'),
          updated_at: new Date().toISOString()
        })
        .eq('id', banner_id);

      if (updateError) {
        console.error('Erro ao atualizar contador de cliques:', updateError);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro na API de tracking:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
