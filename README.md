# Campus Lago — Red Social

> *TRABAJO DE FIN DE CICLO · DAW · ENZO ESPIÑO CORRAL · 2026*  
> *TUTOR: ANDREA CHINNICI*

---

## 1. Justificación

A día de hoy la comunicación y el intercambio de información son pilares
fundamentales dentro del ámbito educativo. Debido a esto, surge la idea de
aportar al centro IES El Lago de una herramienta intuitiva y moderna para
potenciar la colaboración y la participación de toda la comunidad educativa:
estudiantes, profesores y personal administrativo, que pueda servir como
sustitución o como complemento a las ya existentes webs de EducaMadrid.

El desarrollo de una red social interna permitirá crear canales de
comunicación eficaces, fomentar el sentimiento de pertenencia, facilitar el
acceso a recursos didácticos y noticias. Además, ofrecerá un lugar donde
socializar tanto con profesores como con alumnos de otros grados y
compartir ideas y resolver dudas adaptando la estructura de las redes
sociales al entorno académico y respetando la privacidad de los usuarios.

---

## 2. Descripción general

El objetivo es diseñar y desplegar una plataforma web que funcione como
red social interna para el centro. Permitirá unirse a foros, crear y compartir
publicaciones, comentarios y recursos entre estudiantes, profesores y
personal, facilitando la comunicación y el aprendizaje comunitario. Se
emplea una arquitectura Productor (API y base de datos) y Consumidor
(cliente web que accede a la API), cumpliendo las directrices de servicios
web modernos.

---

## 3. Módulos implicados

- **Desarrollo Web en Entorno Servidor:** Implementación de la API, integración de base de datos, validación, roles.
- **Desarrollo Web en Entorno Cliente:** Creación del frontend, uso de la API, interacción, diseño accesible, atractivo y responsive.
- **Despliegue de Aplicaciones Web:** Docker, scripts, hosting cloud, integración continua, backups.
- **Bases de Datos:** Estructuración de tablas, implementación de consultas y relaciones, diseño seguro de la información.
- **Entornos de Desarrollo:** Uso de Git/GitHub, documentación del proceso y uso de herramientas de desarrollo profesional.

---

## 4. Planteamiento técnico

### 4.1 Arquitectura

**Productor**

- API con endpoints para autenticación, gestión de usuarios, publicaciones, comentarios y recursos compartidos.
- Base de datos relacional (MySQL/PostgreSQL), tablas para usuarios, publicaciones, comentarios, archivos/notificaciones.
- Seguridad: validaciones, permisos, roles y protección de datos personales.

**Consumidor**

- Aplicación web cliente.
- Interfaz atractiva y responsive, páginas de muro, perfil, subir/buscar recursos, comentar/crear publicaciones.
- Consumo de la API mediante peticiones HTTP, gestión de sesión, notificaciones.

### 4.2 Requisitos funcionales y técnicos

- Registro/autenticación de usuarios.
- Publicar mensajes y archivos (fotos, enlaces, documentos).
- Comentar y responder publicaciones.
- Búsqueda y filtrado de contenidos/usuarios.
- Notificaciones internas (nuevo comentario, publicación, recurso compartido).
- Panel de administración de usuarios y permisos.
- Seguridad, protección y backup de datos.

### 4.3 Propuesta de despliegue

- Contenedores Docker para backend y frontend.
- Despliegue automatizado en servicios cloud (Heroku, Vercel, AWS).
- Scripts de backup y restauración de base de datos.
- Documentación para instalación, despliegue y mantenimiento.

### 4.4 Documentación técnica y presentación

- Diagrama de arquitectura y modelo de datos.
- Guía del usuario.
- Manual para el equipo docente: instalación y uso, recuperación de copias de seguridad, actualización.
