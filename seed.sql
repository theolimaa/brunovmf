-- VMF AutoStore — Dados de Exemplo
-- Cole esse script no SQL Editor do Neon: https://console.neon.tech

-- =============================================
-- CARROS
-- =============================================

INSERT INTO cars (
  id, brand, model, year, price, cost_price, discount_max, mileage,
  color, fuel, transmission, category, doors, is_premium,
  acquisition_date, description, status
) VALUES

-- 1. Hyundai HB20 S
(
  '11111111-0000-0000-0000-000000000001',
  'Hyundai', 'HB20S Vision', 2023, 72900.00, 63000.00, 2000.00, 28500,
  'Branco', 'Flex', 'Manual', 'Sedan', 4, false,
  '2025-11-10',
  'Único dono, revisões em dia, interior impecável. Nota 10.',
  'available'
),

-- 2. Chevrolet Onix Plus
(
  '11111111-0000-0000-0000-000000000002',
  'Chevrolet', 'Onix Plus Premier', 2023, 89500.00, 77000.00, 3000.00, 18200,
  'Vermelho', 'Flex', 'Automático', 'Sedan', 4, false,
  '2025-12-05',
  'Versão premier com câmera de ré, sensores e central multimídia 8". Sem raspadinhos.',
  'available'
),

-- 3. Toyota Corolla
(
  '11111111-0000-0000-0000-000000000003',
  'Toyota', 'Corolla XEI', 2022, 128000.00, 110000.00, 4000.00, 42100,
  'Prata', 'Flex', 'Automático', 'Sedan', 4, true,
  '2025-10-20',
  'XEI completo: couro, teto solar, controle de cruzeiro adaptativo. Carro de executivo.',
  'available'
),

-- 4. Honda HR-V
(
  '11111111-0000-0000-0000-000000000004',
  'Honda', 'HR-V EX', 2022, 119900.00, 102000.00, 3500.00, 35800,
  'Preto', 'Flex', 'Automático', 'SUV', 4, true,
  '2025-11-28',
  'SUV compacto completo. Sistema Honda Sensing, bancos de couro, carregamento sem fio.',
  'available'
),

-- 5. Jeep Compass
(
  '11111111-0000-0000-0000-000000000005',
  'Jeep', 'Compass Limited', 2021, 147000.00, 126000.00, 5000.00, 58400,
  'Cinza', 'Flex', 'Automático', 'SUV', 4, true,
  '2025-09-15',
  'Limited com teto panorâmico, câmera 360°, bancos ventilados. Referência no segmento.',
  'available'
),

-- 6. Fiat Argo
(
  '11111111-0000-0000-0000-000000000006',
  'Fiat', 'Argo Drive 1.3', 2023, 68500.00, 59000.00, 2000.00, 22300,
  'Azul', 'Flex', 'Manual', 'Hatch', 4, false,
  '2025-12-18',
  'Hatch ágil, econômico e bem conservado. Ótimo pra cidade.',
  'available'
),

-- 7. Chevrolet S10 (reservado)
(
  '11111111-0000-0000-0000-000000000007',
  'Chevrolet', 'S10 LTZ 2.5 4x4', 2021, 189000.00, 162000.00, 6000.00, 74200,
  'Branco', 'Flex', 'Automático', 'Picape', 4, true,
  '2025-08-30',
  'S10 4x4 tração. Suspensão reforçada, câmera de ré, banco do motorista com memória.',
  'reserved'
),

-- 8. Volkswagen Polo
(
  '11111111-0000-0000-0000-000000000008',
  'Volkswagen', 'Polo Highline 200 TSI', 2022, 94900.00, 82000.00, 3000.00, 31600,
  'Branco', 'Flex', 'Automático', 'Hatch', 4, false,
  '2025-11-02',
  'TSI 200 com freios ABS, airbags duplos, multimídia com Apple CarPlay. Dirigibilidade premium.',
  'available'
),

-- 9. Renault Duster
(
  '11111111-0000-0000-0000-000000000009',
  'Renault', 'Duster Iconic 1.6 CVT', 2023, 99500.00, 86000.00, 3500.00, 19800,
  'Laranja', 'Flex', 'Automático', 'SUV', 4, false,
  '2026-01-10',
  'Novo modelo com câmera 360° e ar-condicionado digital. Espaçoso pra família.',
  'available'
),

-- 10. Hyundai Creta
(
  '11111111-0000-0000-0000-000000000010',
  'Hyundai', 'Creta Ultimate', 2023, 138500.00, 118000.00, 5000.00, 24100,
  'Preto', 'Flex', 'Automático', 'SUV', 4, true,
  '2025-12-22',
  'Topo de linha: teto solar, piloto automático, ar-condicionado digital, head-up display.',
  'available'
);


-- =============================================
-- LEADS / CLIENTES
-- =============================================

INSERT INTO leads (
  id, car_id, name, phone, message, status, notes, contacted_at, visit_date
) VALUES

-- 1. Lead novo — interessado no HB20S
(
  '22222222-0000-0000-0000-000000000001',
  '11111111-0000-0000-0000-000000000001',
  'Carlos Henrique Mota', '(85) 99812-3344',
  'Boa tarde! Vi o HB20S no site. Ainda tá disponível? Gostaria de saber sobre financiamento.',
  'lead_novo', NULL, NULL, NULL
),

-- 2. Visita marcada — interessada no HR-V
(
  '22222222-0000-0000-0000-000000000002',
  '11111111-0000-0000-0000-000000000004',
  'Fernanda Lima Cavalcante', '(85) 98743-2211',
  'Quero ver o HR-V pessoalmente. Prefiro algo automático pra cidade.',
  'visita_marcada', 'Veio indicada pela prima que comprou o Onix em fevereiro.',
  '2026-06-28', '2026-07-03'
),

-- 3. Negociando — interessado no Compass
(
  '22222222-0000-0000-0000-000000000003',
  '11111111-0000-0000-0000-000000000005',
  'Rafael Sousa Albuquerque', '(85) 99234-5566',
  'Tenho interesse no Compass. Posso dar meu Argo 2020 como entrada.',
  'negociando', 'Propôs troca com Argo + R$ 80k. Aguardando avaliação do carro dele.',
  '2026-06-25', '2026-06-27'
),

-- 4. Ligar de volta — interessada no Corolla
(
  '22222222-0000-0000-0000-000000000004',
  '11111111-0000-0000-0000-000000000003',
  'Amanda Bezerra Nogueira', '(85) 98651-7788',
  'Vi o Corolla. Preciso conversar com o meu marido antes de decidir.',
  'ligar_de_volta', 'Ligar na quinta-feira de manhã. Muito interessada, só precisa da aprovação do marido.',
  '2026-06-26', NULL
),

-- 5. Negociando — interessado no Creta
(
  '22222222-0000-0000-0000-000000000005',
  '11111111-0000-0000-0000-000000000010',
  'João Paulo Santos Ferreira', '(85) 99978-1122',
  'O Creta tá dentro do que procuro. Quero fechar essa semana se der.',
  'negociando', 'Tem carta de crédito aprovada de R$ 150k no Bradesco. Muito quente.',
  '2026-06-29', '2026-06-30'
),

-- 6. Lead novo — sem carro específico
(
  '22222222-0000-0000-0000-000000000006',
  NULL,
  'Márcia Alves da Silva', '(85) 98812-9900',
  'Olá, estou procurando um SUV até R$ 120.000. Vocês têm algo assim?',
  'lead_novo', NULL, NULL, NULL
);
