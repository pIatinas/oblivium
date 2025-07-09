
-- Inserir cavaleiros baseados nos personagens do site ssloj.com/characters
-- Substitua 'your-user-id-here' pelo ID do usuário admin que irá "criar" esses cavaleiros
-- Você pode encontrar seu user ID na tabela auth.users no Supabase

INSERT INTO public.knights (name, image_url, created_by) VALUES
('Milo', 'https://ssloj.com/images/atlas/icon_tujian/K_miluo_shen.png', (SELECT id FROM auth.users LIMIT 1)),
('Shion', 'https://ssloj.com/images/atlas/icon_tujian/K_ndshiang_baiyang.png', (SELECT id FROM auth.users LIMIT 1)),
('Mystoria', 'https://ssloj.com/images/atlas/icon_tujian/K_misituoliya_shuiping.png', (SELECT id FROM auth.users LIMIT 1)),
('Tenma', 'https://ssloj.com/images/atlas/icon_tujian/K_tianma_tianma.png', (SELECT id FROM auth.users LIMIT 1)),
('Écarlate', 'https://ssloj.com/images/atlas/icon_tujian/K_aikalate_tianxie.png', (SELECT id FROM auth.users LIMIT 1)),
('Alone', 'https://ssloj.com/images/atlas/icon_tujian/K_alon_hades.png', (SELECT id FROM auth.users LIMIT 1)),
('Saga', 'https://ssloj.com/images/atlas/icon_tujian/K_saga_shuangzi.png', (SELECT id FROM auth.users LIMIT 1)),
('Kanon', 'https://ssloj.com/images/atlas/icon_tujian/K_jianong_hailongwang.png', (SELECT id FROM auth.users LIMIT 1)),
('Dohko', 'https://ssloj.com/images/atlas/icon_tujian/K_tonghu_tianping.png', (SELECT id FROM auth.users LIMIT 1)),
('Shura', 'https://ssloj.com/images/atlas/icon_tujian/K_shula_mojie.png', (SELECT id FROM auth.users LIMIT 1)),
('Camus', 'https://ssloj.com/images/atlas/icon_tujian/K_kamiao_shuiping.png', (SELECT id FROM auth.users LIMIT 1)),
('Aiolia', 'https://ssloj.com/images/atlas/icon_tujian/K_aiolia_shizi.png', (SELECT id FROM auth.users LIMIT 1)),
('Aldebaran', 'https://ssloj.com/images/atlas/icon_tujian/K_aludebalan_jinniu.png', (SELECT id FROM auth.users LIMIT 1)),
('Mu', 'https://ssloj.com/images/atlas/icon_tujian/K_mu_baiyang.png', (SELECT id FROM auth.users LIMIT 1)),
('Aioros', 'https://ssloj.com/images/atlas/icon_tujian/K_ailialuoshi_sheshou.png', (SELECT id FROM auth.users LIMIT 1));
