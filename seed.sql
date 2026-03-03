USE campus_lago;

-- Usuarios de prueba (contraseña: password)
INSERT IGNORE INTO users (email, username, password_hash, full_name, role) VALUES
('laura.garcia@educa.madrid.org', 'lauragarcia', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Laura García', 'student'),
('carlos.martin@educa.madrid.org', 'carlosmartin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Carlos Martín', 'student'),
('ana.lopez@educa.madrid.org', 'analopez', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Ana López', 'teacher');

-- Variables con los IDs reales
SET @admin   = (SELECT id FROM users WHERE email = 'admin@educa.madrid.org');
SET @laura   = (SELECT id FROM users WHERE email = 'laura.garcia@educa.madrid.org');
SET @carlos  = (SELECT id FROM users WHERE email = 'carlos.martin@educa.madrid.org');
SET @ana     = (SELECT id FROM users WHERE email = 'ana.lopez@educa.madrid.org');

-- Posts de estudiantes
INSERT INTO posts (user_id, content, post_type) VALUES
(@laura,  'Mensaje de prueba', 'student'),
(@laura,  'Mensaje de prueba', 'student'),
(@carlos, 'Mensaje de prueba', 'student'),
(@carlos, 'Mensaje de prueba', 'student');

-- Noticias oficiales (profesora Ana)
INSERT INTO posts (user_id, content, post_type, is_anonymous) VALUES
(@ana, 'Mensaje de prueba', 'official', 1),
(@ana, 'Mensaje de prueba', 'official', 1),
(@ana, 'Mensaje de prueba', 'official', 0);

-- IDs de los posts recién insertados
SET @p1 = (SELECT id FROM posts WHERE user_id = @laura  ORDER BY id ASC LIMIT 1);
SET @p3 = (SELECT id FROM posts WHERE user_id = @carlos ORDER BY id ASC LIMIT 1);
SET @p5 = (SELECT id FROM posts WHERE user_id = @ana    ORDER BY id ASC LIMIT 1);

-- Likes
INSERT IGNORE INTO likes (user_id, post_id) VALUES
(@admin,  @p1), (@carlos, @p1),
(@admin,  @p3), (@laura,  @p5);

-- Comentarios
INSERT INTO comments (post_id, user_id, content) VALUES
(@p1, @admin,  'Mensaje de prueba'),
(@p1, @carlos, 'Mensaje de prueba'),
(@p3, @laura,  'Mensaje de prueba');

-- Conversación Laura → Admin
INSERT INTO conversations (is_group, name, created_by) VALUES (0, NULL, @laura);
SET @conv1 = LAST_INSERT_ID();
INSERT INTO conversation_members (conversation_id, user_id) VALUES (@conv1, @laura), (@conv1, @admin);
INSERT INTO messages (conversation_id, sender_id, content) VALUES
(@conv1, @laura,  'Mensaje de prueba'),
(@conv1, @admin,  'Mensaje de prueba'),
(@conv1, @laura,  'Mensaje de prueba');

-- Conversación Carlos → Admin
INSERT INTO conversations (is_group, name, created_by) VALUES (0, NULL, @carlos);
SET @conv2 = LAST_INSERT_ID();
INSERT INTO conversation_members (conversation_id, user_id) VALUES (@conv2, @carlos), (@conv2, @admin);
INSERT INTO messages (conversation_id, sender_id, content) VALUES
(@conv2, @carlos, 'Mensaje de prueba'),
(@conv2, @admin,  'Mensaje de prueba');

-- Grupo de prueba
INSERT INTO conversations (is_group, name, created_by) VALUES (1, 'Grupo de prueba', @ana);
SET @conv3 = LAST_INSERT_ID();
INSERT INTO conversation_members (conversation_id, user_id) VALUES
(@conv3, @ana), (@conv3, @admin), (@conv3, @laura), (@conv3, @carlos);
INSERT INTO messages (conversation_id, sender_id, content) VALUES
(@conv3, @ana,    'Mensaje de prueba'),
(@conv3, @laura,  'Mensaje de prueba'),
(@conv3, @carlos, 'Mensaje de prueba');

-- Notificaciones para admin
INSERT INTO notifications (user_id, type, message, reference_id) VALUES
(@admin, 'like',    'Mensaje de prueba', @p1),
(@admin, 'comment', 'Mensaje de prueba', @p1),
(@admin, 'message', 'Mensaje de prueba', @conv1),
(@admin, 'follow',  'Mensaje de prueba', @laura);

SELECT 'Datos de prueba insertados correctamente' AS resultado;
