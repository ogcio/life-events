create table categories(
	id uuid primary key default gen_random_uuid(),
	icon text,
	name_en text not null,
	name_ga text not null,
	sort_order int,
	created_at timestamptz not null default now()
);


create table subcategories(
	id uuid primary key default gen_random_uuid(),
	category_id uuid references categories(id) on delete cascade,
	title_en text not null,
	title_ga text not null,
	text_en text,
	text_ga text,
	sort_order int,
	created_at timestamptz not null default now()
);

create table subcategory_items(
	id uuid primary key default gen_random_uuid(),
	subcategory_id uuid REFERENCES subcategories(id) on delete CASCADE,
	title_en text not null,
	title_ga text not null,
	text_en text,
	text_ga text,
	links jsonb, -- []{href:text, isExternal:bool, name_ga: text, name_en:text}
	sort_order int,
	created_at timestamptz not null default now()
);


insert into categories (
	name_en, name_ga, sort_order
) values('Birth','Breith',1);

insert into categories (
	name_en, name_ga, sort_order
) values('Health','Sláinte',2);

insert into categories (
	name_en, name_ga, sort_order
) values('Driving','Tiomáint',3);

insert into categories (
	name_en, name_ga, sort_order
) values('Employment','Fostaíocht',4);

insert into categories (
	name_en, name_ga, sort_order
) values('Starting a business','Gnó a thosú',5);

insert into categories (
	name_en, name_ga, sort_order
) values('Housing','Tithíocht',6);

with ly as (
insert into categories (
	name_en, name_ga, sort_order
) values('Later years','Blianta ina dhiaidh sin',7)
returning id
), sub_will as(
	insert into subcategories(
		category_id, 
		title_en, 
		title_ga, 
		text_en, 
		text_ga,
		sort_order) 
	values(
		(select id from ly), 
		'Making a Will',
		'Uacht a Dhéanamh',
		'Not everyone thinks about this until it''s too late. Making a will is very important and  helps protect your loved ones after you''re gone',
		'Ní cheapann gach duine faoi seo go dtí go bhfuil sé ró-dhéanach. Tá sé an-tábhachtach uacht a dhéanamh agus cuidíonn sé le do mhuintir a chosaint tar éis duit imeacht',
		1)
	returning id
), items_will as(
insert into subcategory_items(
	subcategory_id,
	title_en,
	title_ga,
	text_en,
	text_ga,
	links,
	sort_order
) values(
	(select id from sub_will),
	'Why make a will',
	'Cén fáth a dhéanamh uacht',
	'Read advice from the Citizen''s Advice Bureau',
	'Léigh comhairle ó na Citizen''s Advice Bureau',
	'[
		{"href":"/", "isExternal":false, "name_en":"Read more", "name_ga":"Léigh níos mó"},
		{"href":"/", "isExternal":true, "name_en":"Create a Will online", "name_ga":"Cruthaigh Uacht ar líne"},
		{"href":"/", "isExternal":false, "name_en":"FAQs", "name_ga":"FAQs"}
		]',
		1
),(
	(select id from sub_will),
	'Find a Solicitor',
	'Aimsigh Aturnae',
	'Affordable legal services for all your needs',
	'Seirbhísí dlí inacmhainne do do chuid riachtanas go léir',
	'[
		{"href":"/", "isExternal":false, "name_en":"Find a Solicitor near you", "name_ga":"Aimsigh Aturnae in aice leat"},
		{"href":"/", "isExternal":false, "name_en":"FAQs", "name_ga":"FAQs"},
		{"href":"", "isExternal":false, "name_en":"", "name_ga":""}
		]',
		2
)
), sub_death as(
		insert into subcategories(
		category_id, 
		title_en, 
		title_ga, 
		text_en, 
		text_ga,
		sort_order) 
	values(
		(select id from ly), 
		'Reporting a Death',
		'Bás a Thuairisciú',
		'',
		'',
		1)
	returning id
)
insert into subcategory_items(
	subcategory_id,
	title_en,
	title_ga,
	text_en,
	text_ga,
	links,
	sort_order
) values(
	(select id from sub_death),
	'Report a death',
	'Bás a thuairisciú',
	'Use the Tell Us Once service',
	'Bain úsáid as an tseirbhís Tell Us Once',
	'[
		{"href":"/", "isExternal":false, "name_en":"Reporting the death", "name_ga":"An bás a thuairisciú"},
		{"href":"/", "isExternal":true, "name_en":"Register the death", "name_ga":"Clárú an bás"},
		{"href":"/", "isExternal":false, "name_en":"FAQs", "name_ga":"FAQs"}
		]',
		1
	),
	(
	(select id from sub_death),
	'Bereavement Support Payment',
	'Íocaíocht Tacaíochta Méala',
	'Bereavement Support Payment is money you can...',
	'Is éard atá san Íocaíocht Tacaíochta Méala ná airgead is féidir leat...',
	'[
		{"href":"/", "isExternal":false, "name_en":"Read more", "name_ga":"Léigh níos mó"},
		{"href":"/", "isExternal":false, "name_en":"FAQs", "name_ga":"FAQs"},
		{"href":"", "isExternal":false, "name_en":"", "name_ga":""}
		]',
		2
	),
	(
	(select id from sub_death),
	'When a death is reported to a coroner',
	'Nuair a thuairiscítear bás do chróinéir',
	'If a death is reported to a coroner, the documents...',
	'Má thuairiscítear bás do chróinéir, beidh na doiciméid...',
	'[
		{"href":"/", "isExternal":false, "name_en":"Read more", "name_ga":"Léigh níos mó"},
		{"href":"/", "isExternal":true, "name_en":"Contact your local Coroner", "name_ga":"Déan teagmháil le do Chróinéir áitiúil"},
		{"href":"", "isExternal":false, "name_en":"", "name_ga":""}
		]',
		3
	),
	(
	(select id from sub_death),
	'Correct a death registration',
	'Clárú báis a cheartú',
	'Correct an original registration with the register...',
	'Clárú bunaidh a cheartú leis an gclár...',
	'[
		{"href":"/", "isExternal":false, "name_en":"Read more", "name_ga":"Léigh níos mó"},
		{"href":"/", "isExternal":true, "name_en":"Correct a death registration", "name_ga":"Clárú báis a cheartú"},
		{"href":"/", "isExternal":false, "name_en":"FAQs", "name_ga":"FAQs"}
		]',
		4
	);