INSERT INTO feature_flags (application, slug, title, description, is_enabled) 
VALUES ('portal', 'eventsMenu', 'eventsMenu', 'Displays the hamburger menu for navigation', false)
ON CONFLICT (application, slug) DO NOTHING;

INSERT INTO feature_flags (application, slug, title, description, is_enabled) 
VALUES ('portal', 'messages', 'messages', 'Displays the link to the messages app', false)
ON CONFLICT (application, slug) DO NOTHING;

INSERT INTO feature_flags (application, slug, title, description, is_enabled) 
VALUES ('portal', 'timeline', 'timeline', 'Displays the timeline feature', false)
ON CONFLICT (application, slug) DO NOTHING;

INSERT INTO feature_flags (application, slug, title, description, is_enabled) 
VALUES ('portal', 'digitalWallet', 'digitalWallet', 'Displays the digital wallet feature', false)
ON CONFLICT (application, slug) DO NOTHING;

INSERT INTO feature_flags (application, slug, title, description, is_enabled) 
VALUES ('portal', 'aboutMe', 'aboutMe', 'Displays the about me feature', false)
ON CONFLICT (application, slug) DO NOTHING;

INSERT INTO feature_flags (application, slug, title, description, is_enabled) 
VALUES ('portal', 'birth', 'birth', 'Displays the birth feature', false)
ON CONFLICT (application, slug) DO NOTHING;

INSERT INTO feature_flags (application, slug, title, description, is_enabled) 
VALUES ('portal', 'death', 'death', 'Displays the death feature', false)
ON CONFLICT (application, slug) DO NOTHING;

INSERT INTO feature_flags (application, slug, title, description, is_enabled) 
VALUES ('portal', 'events', 'events', 'Displays the events feature', false)
ON CONFLICT (application, slug) DO NOTHING;

INSERT INTO feature_flags (application, slug, title, description, is_enabled) 
VALUES ('portal', 'health', 'health', 'Displays the health feature', false)
ON CONFLICT (application, slug) DO NOTHING;

INSERT INTO feature_flags (application, slug, title, description, is_enabled) 
VALUES ('portal', 'driving', 'driving', 'Displays the driving feature', false)
ON CONFLICT (application, slug) DO NOTHING;

INSERT INTO feature_flags (application, slug, title, description, is_enabled) 
VALUES ('portal', 'employment', 'employment', 'Displays the employment feature', false)
ON CONFLICT (application, slug) DO NOTHING;

INSERT INTO feature_flags (application, slug, title, description, is_enabled) 
VALUES ('portal', 'business', 'business', 'Displays the business feature', false)
ON CONFLICT (application, slug) DO NOTHING;

INSERT INTO feature_flags (application, slug, title, description, is_enabled) 
VALUES ('portal', 'housing', 'housing', 'Displays the housing feature', false)
ON CONFLICT (application, slug) DO NOTHING;
