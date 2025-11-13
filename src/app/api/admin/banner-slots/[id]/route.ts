import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET /api/admin/banner-slots/[id] - Buscar slot específico
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { data: slot, error: slotError } = await supabase
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
      .eq('id', params.id)
      .single();

    if (slotError) {
      if (slotError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Slot não encontrado' },
          { status: 404 }
        );
      }
      throw slotError;
    }

    return NextResponse.json({ slot });

  } catch (error) {
    console.error('Erro na API de slot:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/banner-slots/[id] - Atualizar slot
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    
    // Validar slug único (se estiver sendo alterado)
    if (body.slug) {
      const { data: existingSlot } = await supabase
        .from('banner_slots')
        .select('id')
        .eq('slug', body.slug)
        .neq('id', params.id)
        .single();

      if (existingSlot) {
        return NextResponse.json(
          { error: 'Slug já existe. Escolha um slug único.' },
          { status: 400 }
        );
      }
    }

    // Atualizar slot
    const { data: updatedSlot, error: updateError } = await supabase
      .from('banner_slots')
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Slot não encontrado' },
          { status: 404 }
        );
      }
      throw updateError;
    }

    return NextResponse.json({ slot: updatedSlot });

  } catch (error) {
    console.error('Erro na API de atualização de slot:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/banner-slots/[id] - Deletar slot
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Verificar se existem banners neste slot
    const { data: banners } = await supabase
      .from('banners')
      .select('id')
      .eq('position', params.id)
      .limit(1);

    if (banners && banners.length > 0) {
      return NextResponse.json(
        { error: 'Não é possível deletar este slot pois existem banners associados a ele.' },
        { status: 400 }
      );
    }

    // Deletar slot
    const { error: deleteError } = await supabase
      .from('banner_slots')
      .delete()
      .eq('id', params.id);

    if (deleteError) {
      throw deleteError;
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Erro na API de exclusão de slot:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}