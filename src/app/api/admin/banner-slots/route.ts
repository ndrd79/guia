import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET /api/admin/banner-slots - Listar todos os slots
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se é admin
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Requer permissão de administrador.' },
        { status: 403 }
      );
    }

    // Buscar slots com templates
    const { data: slots, error: slotsError } = await supabase
      .from('banner_slots')
      .select(`
        *,
        banner_templates!banner_slots_template_id_fkey (
          id,
          name,
          type,
          config
        )
      `)
      .order('priority', { ascending: true });

    if (slotsError) {
      console.error('Erro ao buscar slots:', slotsError);
      return NextResponse.json(
        { error: 'Erro ao buscar posições de banners' },
        { status: 500 }
      );
    }

    return NextResponse.json({ slots });

  } catch (error) {
    console.error('Erro na API de slots:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// POST /api/admin/banner-slots - Criar novo slot
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    
    // Verificar autenticação
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Não autorizado' },
        { status: 401 }
      );
    }

    // Verificar se é admin
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Acesso negado. Requer permissão de administrador.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    
    // Validar dados obrigatórios
    const requiredFields = ['name', 'slug', 'template_id'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { error: `Campos obrigatórios faltando: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validar slug único
    const { data: existingSlot } = await supabase
      .from('banner_slots')
      .select('id')
      .eq('slug', body.slug)
      .single();

    if (existingSlot) {
      return NextResponse.json(
        { error: 'Slug já existe. Escolha um slug único.' },
        { status: 400 }
      );
    }

    // Criar slot
    const { data: newSlot, error: createError } = await supabase
      .from('banner_slots')
      .insert([{
        ...body,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (createError) {
      console.error('Erro ao criar slot:', createError);
      return NextResponse.json(
        { error: 'Erro ao criar posição de banner' },
        { status: 500 }
      );
    }

    return NextResponse.json({ slot: newSlot });

  } catch (error) {
    console.error('Erro na API de criação de slot:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}