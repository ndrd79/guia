// Script para inserir eventos de exemplo
// Execute com: npx tsx scripts/seed-eventos.ts

require('dotenv').config({ path: '.env.local' });

const eventos = [
    {
        titulo: 'Show Sertanejo - Luan Santana',
        tipo: 'show',
        data_hora: '2025-12-20T21:00:00',
        local: 'Arena Municipal',
        imagem: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=400&fit=crop',
        descricao: 'Grande show sertanejo com Luan Santana e convidados especiais.',
    },
    {
        titulo: 'Festa de Réveillon 2025',
        tipo: 'festa',
        data_hora: '2025-12-31T22:00:00',
        local: 'Praça Central',
        imagem: 'https://images.unsplash.com/photo-1467810563316-b5476525c0f9?w=800&h=400&fit=crop',
        descricao: 'Virada do ano com shows, queima de fogos e muita festa!',
    },
    {
        titulo: 'Carnaval de Rua 2025',
        tipo: 'festival',
        data_hora: '2026-02-15T16:00:00',
        local: 'Centro da Cidade',
        imagem: 'https://images.unsplash.com/photo-1551845041-63e8e76836ea?w=800&h=400&fit=crop',
        descricao: 'Blocos de rua, escola de samba e muita alegria.',
    },
    {
        titulo: 'Festival Gastronômico',
        tipo: 'festival',
        data_hora: '2026-01-18T11:00:00',
        local: 'Parque Municipal',
        imagem: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=400&fit=crop',
        descricao: 'Os melhores chefs da região em um só lugar.',
    },
    {
        titulo: 'Feira de Artesanato',
        tipo: 'feira',
        data_hora: '2025-12-28T09:00:00',
        local: 'Praça da Matriz',
        imagem: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=400&fit=crop',
        descricao: 'Produtos artesanais, comidas típicas e apresentações culturais.',
    },
];

async function seedEventos() {
    const { createClient } = await import('@supabase/supabase-js');

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🌱 Inserindo eventos de exemplo...\n');

    for (const evento of eventos) {
        const { data, error } = await supabase
            .from('eventos')
            .insert([evento])
            .select();

        if (error) {
            console.error(`❌ Erro ao inserir "${evento.titulo}":`, error.message);
        } else {
            console.log(`✅ Inserido: ${evento.titulo}`);
        }
    }

    console.log('\n🎉 Seed de eventos concluído!');
}

seedEventos();
