USE campus_lago;

-- ============================================================
-- USUARIOS  (contraseña en todos: password)
-- ============================================================
INSERT IGNORE INTO users (email, username, password_hash, full_name, role) VALUES
('laura.garcia@educa.madrid.org',       'lauragarcia',     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Laura García',        'student'),
('carlos.martin@educa.madrid.org',      'carlosmartin',    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Carlos Martín',       'student'),
('ana.lopez@educa.madrid.org',          'analopez',        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ana López',           'teacher'),
('alejandro.rodriguez@educa.madrid.org','alexrdz',         '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Alejandro Rodríguez', 'student'),
('maria.fernandez@educa.madrid.org',    'mariafernandez',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'María Fernández',     'student'),
('pablo.gonzalez@educa.madrid.org',     'pablogonzalez',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Pablo González',      'student'),
('sara.diaz@educa.madrid.org',          'saradiaz',        '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sara Díaz',           'student'),
('miguel.hernandez@educa.madrid.org',   'miguelhernandez', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Miguel Hernández',    'student'),
('elena.sanchez@educa.madrid.org',      'elenasanchez',    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Elena Sánchez',       'student'),
('david.torres@educa.madrid.org',       'davidtorres',     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'David Torres',        'student'),
('lucia.ramirez@educa.madrid.org',      'luciaramirez',    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Lucía Ramírez',       'student'),
('javier.moreno@educa.madrid.org',      'javiermoreno',    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Javier Moreno',       'student'),
('andrea.jimenez@educa.madrid.org',     'andreajimenez',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Andrea Jiménez',      'student'),
('rafael.munoz@educa.madrid.org',       'rafaelmunoz',     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Rafael Muñoz',        'teacher'),
('pilar.castro@educa.madrid.org',       'pilarcastro',     '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Pilar Castro',        'teacher');

-- ============================================================
-- VARIABLES
-- ============================================================
SET @admin  = (SELECT id FROM users WHERE email = 'admin@educa.madrid.org');
SET @laura  = (SELECT id FROM users WHERE email = 'laura.garcia@educa.madrid.org');
SET @carlos = (SELECT id FROM users WHERE email = 'carlos.martin@educa.madrid.org');
SET @ana    = (SELECT id FROM users WHERE email = 'ana.lopez@educa.madrid.org');
SET @alex   = (SELECT id FROM users WHERE email = 'alejandro.rodriguez@educa.madrid.org');
SET @maria  = (SELECT id FROM users WHERE email = 'maria.fernandez@educa.madrid.org');
SET @pablo  = (SELECT id FROM users WHERE email = 'pablo.gonzalez@educa.madrid.org');
SET @sara   = (SELECT id FROM users WHERE email = 'sara.diaz@educa.madrid.org');
SET @miguel = (SELECT id FROM users WHERE email = 'miguel.hernandez@educa.madrid.org');
SET @elena  = (SELECT id FROM users WHERE email = 'elena.sanchez@educa.madrid.org');
SET @david  = (SELECT id FROM users WHERE email = 'david.torres@educa.madrid.org');
SET @lucia  = (SELECT id FROM users WHERE email = 'lucia.ramirez@educa.madrid.org');
SET @javier = (SELECT id FROM users WHERE email = 'javier.moreno@educa.madrid.org');
SET @andrea = (SELECT id FROM users WHERE email = 'andrea.jimenez@educa.madrid.org');
SET @rafael = (SELECT id FROM users WHERE email = 'rafael.munoz@educa.madrid.org');
SET @pilar  = (SELECT id FROM users WHERE email = 'pilar.castro@educa.madrid.org');

-- ============================================================
-- BIOS
-- ============================================================
UPDATE users SET bio = 'Alumna de 2º DAW. Amante del frontend y del café con leche.' WHERE id = @laura;
UPDATE users SET bio = 'Estudiante de DAW. Fanático del backend y los videojuegos.' WHERE id = @carlos;
UPDATE users SET bio = 'Profesora de Bases de Datos y Programación. Consultas por mensajes.' WHERE id = @ana;
UPDATE users SET bio = 'Estudiante de 1º ASIR. Me apasionan las redes y los sistemas.' WHERE id = @alex;
UPDATE users SET bio = 'Alumna de 2º SMR. Diseñadora en mis ratos libres.' WHERE id = @maria;
UPDATE users SET bio = 'DAW nocturno. Trabajo por el día, estudio por la noche.' WHERE id = @pablo;
UPDATE users SET bio = 'Primera semana en el instituto. Todavía encontrando el camino.' WHERE id = @sara;
UPDATE users SET bio = 'ASIR. Linux, Docker y poca gente.' WHERE id = @miguel;
UPDATE users SET bio = 'Alumna de 2º DAW. Recién descubierta la magia del CSS.' WHERE id = @elena;
UPDATE users SET bio = 'Estudiante de SMR. Músico los fines de semana.' WHERE id = @david;
UPDATE users SET bio = 'DAW 2º. Me interesa la ciberseguridad.' WHERE id = @lucia;
UPDATE users SET bio = 'ASIR. Me peleo con el DNS y el Active Directory cada día.' WHERE id = @javier;
UPDATE users SET bio = 'Alumna de 1º DAW. Vengo del mundo del diseño gráfico.' WHERE id = @andrea;
UPDATE users SET bio = 'Profesor de Matemáticas y Estadística. Aquí resuelvo dudas.' WHERE id = @rafael;
UPDATE users SET bio = 'Profesora de Lengua y Literatura. Tutora de 2º DAW.' WHERE id = @pilar;

-- ============================================================
-- POSTS
-- ============================================================
INSERT INTO posts (user_id, content, post_type) VALUES
(@laura,  '¿Alguien ha entendido el ejercicio 3 de la hoja de repaso de Matemáticas? Llevo media hora bloqueada.', 'student'),
(@laura,  'Subiendo los apuntes de Bases de Datos de hoy por si alguien los necesita. Por mensajes os los paso.', 'student'),
(@carlos, 'Por fin terminé el proyecto de programación. Qué tarde más larga...', 'student'),
(@carlos, '¿Alguien se apunta a estudiar en la biblioteca mañana a las 16h? Tengo el parcial pasado mañana.', 'student'),
(@alex,   'Primera semana de ASIR y ya tengo deberes de tres asignaturas. Bienvenido a la fiesta.', 'student'),
(@alex,   'Pregunta para los de 2º: ¿el examen de Redes del año pasado era muy difícil?', 'student'),
(@maria,  'Buscando compañeros para estudiar el examen de la semana que viene. El aula 3 tiene sitio por las tardes.', 'student'),
(@pablo,  'Trabajo todo el día, llego a casa, estudio hasta la una... pero merece la pena. Ánimo a todos los que estáis igual.', 'student'),
(@pablo,  '¿Alguien sabe qué IDE prefiere Rafael Muñoz para las prácticas de Java? No lo puso en el enunciado.', 'student'),
(@sara,   '¡Primer día aquí! Todavía un poco perdida entre tantas clases y horarios. Espero pillarle el truco pronto.', 'student'),
(@miguel, 'Nadie me avisó de que configurar RAID en el servidor de prácticas iba a ser tan entretenido. Llevo dos horas.', 'student'),
(@elena,  'Acabo de descubrir que puedo usar variables CSS para el proyecto de interfaces. Por qué no lo sabía antes.', 'student'),
(@elena,  'Reunión de grupo para la práctica de DAW mañana a las 17:30 en el aula de informática. Confirmad asistencia.', 'student'),
(@david,  'El recreo bajo la lluvia ya es tradición aquí. ¿Cuándo van a arreglar la zona cubierta?', 'student'),
(@lucia,  'Empezando a estudiar criptografía por mi cuenta. Si alguien quiere hacer un grupo de estudio que me escriba.', 'student'),
(@javier, 'Dos horas mirando un error de DNS y resulta que era un punto y coma de más en el archivo de zona. La vida.', 'student'),
(@andrea, 'Vengo del diseño gráfico y el CSS me parece magia. ¿Cómo le ponéis nombre a las variables de color?');

INSERT INTO posts (user_id, content, post_type, is_anonymous) VALUES
(@ana,    'Recordad que el plazo de entrega de la práctica 2 de Bases de Datos es el viernes a las 23:59h. Sin excepciones.', 'official', 1),
(@ana,    'El examen de Programación del martes queda aplazado al miércoles a las 10:00h. Consultad el tablón para el aula.', 'official', 0),
(@rafael, 'Los ejercicios de repaso del tema 4 están disponibles en el aula virtual. Se recomienda hacerlos antes del jueves.', 'official', 1),
(@pilar,  'La tutoría de esta tarde queda aplazada al lunes de la semana que viene. Disculpad las molestias.', 'official', 0);

-- Posts adicionales para mayor variedad en el feed
INSERT INTO posts (user_id, content, post_type) VALUES
(@david,   'test', 'student'),
(@lucia,   'test', 'student'),
(@javier,  'test', 'student'),
(@andrea,  'test', 'student'),
(@miguel,  'test', 'student'),
(@sara,    'test', 'student'),
(@pablo,   'test', 'student'),
(@maria,   'test', 'student'),
(@elena,   'test', 'student'),
(@carlos,  'test', 'student'),
(@laura,   'test', 'student'),
(@alex,    'test', 'student');

-- ============================================================
-- VARIABLES DE POSTS (para likes y comentarios)
-- ============================================================
SET @p_laura1  = (SELECT id FROM posts WHERE user_id = @laura  ORDER BY id ASC LIMIT 1);
SET @p_laura2  = (SELECT id FROM posts WHERE user_id = @laura  ORDER BY id ASC LIMIT 1 OFFSET 1);
SET @p_carlos1 = (SELECT id FROM posts WHERE user_id = @carlos ORDER BY id ASC LIMIT 1);
SET @p_alex1   = (SELECT id FROM posts WHERE user_id = @alex   ORDER BY id ASC LIMIT 1);
SET @p_pablo1  = (SELECT id FROM posts WHERE user_id = @pablo  ORDER BY id ASC LIMIT 1);
SET @p_sara1   = (SELECT id FROM posts WHERE user_id = @sara   ORDER BY id ASC LIMIT 1);
SET @p_miguel1 = (SELECT id FROM posts WHERE user_id = @miguel ORDER BY id ASC LIMIT 1);
SET @p_elena1  = (SELECT id FROM posts WHERE user_id = @elena  ORDER BY id ASC LIMIT 1);
SET @p_lucia1  = (SELECT id FROM posts WHERE user_id = @lucia  ORDER BY id ASC LIMIT 1);
SET @p_javier1 = (SELECT id FROM posts WHERE user_id = @javier ORDER BY id ASC LIMIT 1);
SET @p_andrea1 = (SELECT id FROM posts WHERE user_id = @andrea ORDER BY id ASC LIMIT 1);
SET @p_ana1    = (SELECT id FROM posts WHERE user_id = @ana    ORDER BY id ASC LIMIT 1);

-- ============================================================
-- LIKES
-- ============================================================
INSERT IGNORE INTO likes (user_id, post_id) VALUES
(@carlos, @p_laura1), (@alex,  @p_laura1), (@elena, @p_laura1), (@miguel, @p_laura1),
(@laura,  @p_carlos1),(@elena, @p_carlos1),
(@laura,  @p_alex1),  (@maria, @p_alex1),  (@miguel, @p_alex1),
(@carlos, @p_pablo1), (@elena, @p_pablo1), (@laura,  @p_pablo1),
(@alex,   @p_sara1),  (@maria, @p_sara1),  (@elena,  @p_sara1),  (@andrea, @p_sara1),
(@alex,   @p_miguel1),(@javier,@p_miguel1),(@carlos, @p_miguel1),
(@laura,  @p_elena1), (@andrea,@p_elena1), (@maria,  @p_elena1),
(@elena,  @p_lucia1), (@andrea,@p_lucia1), (@laura,  @p_lucia1),
(@alex,   @p_javier1),(@miguel,@p_javier1),
(@elena,  @p_andrea1),(@laura, @p_andrea1),(@maria,  @p_andrea1),(@lucia, @p_andrea1),
(@laura,  @p_ana1),   (@carlos,@p_ana1),   (@elena,  @p_ana1);

-- ============================================================
-- COMENTARIOS
-- ============================================================
INSERT INTO comments (post_id, user_id, content) VALUES
(@p_laura1,  @carlos, 'Yo tampoco lo entendí, igual luego le pregunto a Pilar en tutoría.'),
(@p_laura1,  @alex,   'Yo tuve el mismo problema la semana pasada. Al final era un error de signo.'),
(@p_carlos1, @laura,  'Suerte! Yo estoy igual con el mío pero para el viernes.'),
(@p_alex1,   @miguel, 'El de Redes del año pasado no fue para tanto, tranquilo.'),
(@p_alex1,   @javier, 'Si quieres te paso unos apuntes del año pasado, me escribes.'),
(@p_pablo1,  @carlos, 'Esto es exactamente yo. Ánimo compañero.'),
(@p_sara1,   @laura,  'Bienvenida! Si necesitas ayuda con algo no dudes en preguntar.'),
(@p_sara1,   @elena,  'El primer mes es el más difícil, luego ya le pillas el ritmo. Bienvenida!'),
(@p_miguel1, @javier, 'Clásico. A mí me pasó igual con el LVM la semana pasada.'),
(@p_elena1,  @andrea, 'Las variables CSS son lo mejor que existe. Cambia la vida.'),
(@p_andrea1, @elena,  'Yo uso nombres tipo --color-primary, --color-accent... al principio no sabes pero luego se agradece.'),
(@p_lucia1,  @elena,  'Me apunto al grupo de estudio! Te escribo por mensajes.');

-- ============================================================
-- FOLLOWS (los nuevos usuarios se siguen entre sí;
--           laura/carlos/admin NO siguen a los nuevos
--           → aparecen en Explorar cuando entras con esas cuentas)
-- ============================================================
INSERT IGNORE INTO follows (follower_id, following_id) VALUES
-- laura y carlos se siguen mutuamente; siguen a la profe Ana
(@laura,  @carlos), (@carlos, @laura),
(@laura,  @ana),    (@carlos, @ana),
-- red entre los nuevos alumnos
(@alex,   @miguel), (@alex,   @pablo),  (@alex,   @maria),
(@maria,  @elena),  (@maria,  @laura),  (@maria,  @alex),
(@pablo,  @carlos), (@pablo,  @elena),
(@sara,   @alex),   (@sara,   @maria),  (@sara,   @lucia),
(@miguel, @alex),   (@miguel, @javier),
(@elena,  @laura),  (@elena,  @andrea), (@elena,  @maria),
(@david,  @carlos), (@david,  @miguel),
(@lucia,  @elena),  (@lucia,  @andrea),
(@javier, @miguel), (@javier, @alex),
(@andrea, @elena),  (@andrea, @laura);

-- ============================================================
-- CONVERSACIONES Y MENSAJES
-- ============================================================

-- Laura ↔ Admin
INSERT INTO conversations (is_group, name, created_by) VALUES (0, NULL, @laura);
SET @conv1 = LAST_INSERT_ID();
INSERT INTO conversation_members (conversation_id, user_id) VALUES (@conv1, @laura), (@conv1, @admin);
INSERT INTO messages (conversation_id, sender_id, content) VALUES
(@conv1, @laura, 'Hola, quería preguntar por los permisos de la plataforma.'),
(@conv1, @admin, 'Claro, dime qué necesitas.'),
(@conv1, @laura, 'Solo quería saber si es normal que no pueda editar mi post de ayer.');

-- Carlos ↔ Admin
INSERT INTO conversations (is_group, name, created_by) VALUES (0, NULL, @carlos);
SET @conv2 = LAST_INSERT_ID();
INSERT INTO conversation_members (conversation_id, user_id) VALUES (@conv2, @carlos), (@conv2, @admin);
INSERT INTO messages (conversation_id, sender_id, content) VALUES
(@conv2, @carlos, 'Buenas, he tenido un problema al iniciar sesión esta mañana.'),
(@conv2, @admin,  'Ya lo revisé, era un problema temporal. ¿Ahora funciona bien?'),
(@conv2, @carlos, 'Sí, ya va perfecto. Gracias.');

-- Elena ↔ Laura
INSERT INTO conversations (is_group, name, created_by) VALUES (0, NULL, @elena);
SET @conv3 = LAST_INSERT_ID();
INSERT INTO conversation_members (conversation_id, user_id) VALUES (@conv3, @elena), (@conv3, @laura);
INSERT INTO messages (conversation_id, sender_id, content) VALUES
(@conv3, @elena, 'Oye, ¿vienes mañana a la reunión del proyecto?'),
(@conv3, @laura, 'Sí, a las 17:30 en el aula de informática ¿no?'),
(@conv3, @elena, 'Exacto. Trae el avance que tengas aunque sea poco.');

-- Alex ↔ Pablo
INSERT INTO conversations (is_group, name, created_by) VALUES (0, NULL, @alex);
SET @conv4 = LAST_INSERT_ID();
INSERT INTO conversation_members (conversation_id, user_id) VALUES (@conv4, @alex), (@conv4, @pablo);
INSERT INTO messages (conversation_id, sender_id, content) VALUES
(@conv4, @alex,  '¿Tú también estás en DAW nocturno o en el diurno?'),
(@conv4, @pablo, 'Nocturno. Y tú ¿ASIR?'),
(@conv4, @alex,  'Sí, primer año. Oye, ¿qué tal se lleva lo de trabajar y estudiar a la vez?'),
(@conv4, @pablo, 'Duro pero se puede. El truco es ir al día, si te atragas con los apuntes ya no hay quien lo saque.');

-- Grupo de clase (Ana, Laura, Carlos, Elena)
INSERT INTO conversations (is_group, name, created_by) VALUES (1, 'DAW 2º - General', @ana);
SET @conv5 = LAST_INSERT_ID();
INSERT INTO conversation_members (conversation_id, user_id) VALUES
  (@conv5, @ana), (@conv5, @laura), (@conv5, @carlos), (@conv5, @elena);
INSERT INTO messages (conversation_id, sender_id, content) VALUES
(@conv5, @ana,    'Buenos días a todos. Recordad el plazo del viernes para la práctica 2.'),
(@conv5, @laura,  'Recibido, gracias profe.'),
(@conv5, @carlos, 'Una pregunta: ¿el esquema E/R hay que entregarlo en papel o en digital?'),
(@conv5, @ana,    'Digital está bien, en PDF.'),
(@conv5, @elena,  'Perfecto, yo ya lo tengo casi listo.');

-- ============================================================
-- NOTIFICACIONES (para admin)
-- ============================================================
INSERT INTO notifications (user_id, type, message, reference_id) VALUES
(@admin, 'like',    'Laura García ha dado me gusta a una publicación.', @p_laura1),
(@admin, 'comment', 'Carlos Martín ha comentado una publicación.',      @p_laura1),
(@admin, 'message', 'Tienes un mensaje nuevo de Laura García.',         @conv1),
(@admin, 'follow',  'Alejandro Rodríguez ha empezado a seguirte.',      @alex);

SELECT 'Datos de prueba insertados correctamente' AS resultado;
