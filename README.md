# Radio PWA 📻

Una aplicación web progresiva (PWA) completa para radio online con integración de AzuraCast y ZenoFM, panel de administración, autenticación de usuarios y funcionalidades offline.

## 🚀 Características

### ✨ Funcionalidades Principales
- **Reproductor de Audio**: Streaming en vivo con controles intuitivos
- **PWA Completa**: Instalable, funciona offline, notificaciones push
- **Múltiples Fuentes**: Integración con AzuraCast y ZenoFM
- **Programación**: Horarios de programas y shows
- **Redes Sociales**: Enlaces a plataformas sociales
- **Historial**: Seguimiento de canciones reproducidas
- **Panel de Usuario**: Dashboard personalizado
- **Panel de Administración**: Control total del sistema

### 🛡️ Autenticación y Seguridad
- Sistema de login seguro con JWT
- Roles de usuario (Admin, DJ, Usuario)
- Middleware de autenticación
- Protección de rutas administrativas

### 💾 Base de Datos
- **MongoDB**: Base de datos principal
- Modelos para usuarios, canciones, programación
- APIs RESTful para operaciones CRUD
- Agregaciones para analytics

### 📱 PWA Features
- **Service Worker**: Cache inteligente y funcionalidad offline
- **App Manifest**: Instalación nativa
- **Push Notifications**: Notificaciones en tiempo real
- **Responsive Design**: Optimizado para todos los dispositivos

## 🛠️ Tecnologías

### Frontend
- **HTML5** con elementos semánticos
- **CSS3** con variables CSS y Grid/Flexbox
- **JavaScript ES6+** modular y orientado a objetos
- **Service Workers** para PWA
- **Font Awesome** para iconografía
- **Google Fonts** (Inter)

### Backend
- **Node.js** con Express.js
- **MongoDB** con Mongoose
- **JWT** para autenticación
- **Socket.io** para actualizaciones en tiempo real
- **Node-cron** para tareas programadas
- **Helmet** y CORS para seguridad

### APIs Integradas
- **AzuraCast API** para streaming y metadata
- **ZenoFM API** para streaming alternativo
- **Push API** para notificaciones
- **Media Session API** para controles de media

## 📦 Instalación

### Prerrequisitos
- Node.js (v16 o superior)
- MongoDB (local o remoto)
- NPM o Yarn

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/grupotrabullagency/Radio-pwa.git
   cd Radio-pwa
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Editar .env con tus configuraciones
   ```

4. **Iniciar MongoDB**
   ```bash
   # Si usas MongoDB local
   mongod
   ```

5. **Iniciar la aplicación**
   ```bash
   # Desarrollo
   npm run dev
   
   # Producción
   npm start
   ```

6. **Acceder a la aplicación**
   - Aplicación: `http://localhost:3000`
   - API Health: `http://localhost:3000/api/health`

## 🚀 Uso

### Usuarios de Prueba
- **Administrador**: `admin` / `admin`
- **Usuario**: `user` / `user`

### Funcionalidades por Rol

#### Usuario Regular
- Escuchar radio en vivo
- Ver programación
- Acceder a redes sociales
- Ver historial de reproducción
- Instalar PWA

#### Administrador
- Todas las funciones de usuario
- Panel de administración
- Gestión de streams
- Gestión de usuarios
- Analytics avanzados
- Configuración del sistema

## 📱 PWA Installation

### Instalación Manual
1. Abrir la aplicación en un navegador compatible
2. Buscar el ícono "Instalar" en la barra de direcciones
3. O usar el prompt de instalación en la aplicación

### Características Offline
- Interfaz principal disponible offline
- Configuraciones guardadas localmente
- Historial local
- Sincronización automática al reconectar

## 🔧 Configuración

### AzuraCast Setup
```javascript
// En .env
AZURACAST_API_URL=https://tu-instancia.azuracast.com/api
AZURACAST_API_KEY=tu-api-key
```

### ZenoFM Setup
```javascript
// En .env
ZENOFM_API_URL=https://zeno.fm/api
ZENOFM_STREAM_ID=tu-stream-id
```

### MongoDB Configuration
```javascript
// Local
MONGODB_URI=mongodb://localhost:27017/radio-pwa

// Remote (Atlas)
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/radio-pwa
```

## 📊 API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/validate` - Validar token
- `POST /api/auth/logout` - Cerrar sesión

### Radio
- `GET /api/radio/stats` - Estadísticas generales
- `GET /api/radio/activity` - Actividad reciente
- `POST /api/radio/settings` - Actualizar configuración

### Streaming
- `GET /api/azuracast/nowplaying` - Info actual AzuraCast
- `GET /api/azuracast/history` - Historial AzuraCast
- `GET /api/zenofm/metadata` - Metadata ZenoFM
- `GET /api/zenofm/stats` - Estadísticas ZenoFM

### MongoDB
- `POST /api/mongodb/:collection` - Crear documento
- `GET /api/mongodb/:collection` - Leer documentos
- `PUT /api/mongodb/:collection/:id` - Actualizar
- `DELETE /api/mongodb/:collection/:id` - Eliminar

### Administración
- `GET /api/admin/data` - Datos del dashboard
- `POST /api/admin/stream/toggle` - Control de streams
- `GET /api/admin/analytics` - Analytics avanzados

## 🎨 Estructura del Proyecto

```
Radio-pwa/
├── 📁 css/
│   └── styles.css          # Estilos principales
├── 📁 js/
│   ├── app.js             # Aplicación principal
│   ├── player.js          # Reproductor de audio
│   ├── pwa.js            # Funcionalidad PWA
│   └── auth.js           # Autenticación
├── 📁 routes/
│   ├── auth.js           # Rutas de autenticación
│   ├── radio.js          # Rutas de radio
│   ├── admin.js          # Rutas de administración
│   ├── azuracast.js      # Integración AzuraCast
│   ├── zenofm.js         # Integración ZenoFM
│   └── mongodb.js        # Operaciones MongoDB
├── 📁 models/
│   └── User.js           # Modelo de usuario
├── 📁 services/
│   ├── scheduler.js      # Tareas programadas
│   └── streamMonitor.js  # Monitor de streams
├── 📁 middleware/
│   └── auth.js           # Middleware de autenticación
├── 📁 icons/             # Iconos PWA
├── 📁 images/            # Imágenes de la app
├── index.html            # Página principal
├── manifest.json         # Manifiesto PWA
├── sw.js                # Service Worker
├── offline.html         # Página offline
├── server.js            # Servidor Node.js
└── package.json         # Dependencias
```

## 🔒 Seguridad

- **HTTPS**: Requerido para PWA y Service Workers
- **JWT Tokens**: Autenticación segura
- **CORS**: Configuración de origen cruzado
- **Helmet**: Headers de seguridad
- **Validación**: Sanitización de datos de entrada
- **Rate Limiting**: Prevención de abuso de API

## 📈 Analytics

### Métricas Disponibles
- Oyentes actuales y históricos
- Canciones más reproducidas
- Distribución geográfica
- Dispositivos utilizados
- Tiempo de escucha promedio

### Tracking de Eventos
- Instalación PWA
- Interacciones de usuario
- Errores de reproducción
- Cambios de configuración

## 🌐 Despliegue

### Desarrollo Local
```bash
npm run dev
```

### Producción
```bash
# Con PM2
npm install -g pm2
pm2 start server.js --name radio-pwa

# Con Docker
docker build -t radio-pwa .
docker run -p 3000:3000 radio-pwa
```

### Variables de Entorno de Producción
```bash
NODE_ENV=production
PORT=80
MONGODB_URI=mongodb+srv://...
JWT_SECRET=super-secure-secret
```

## 🤝 Contribución

1. Fork el proyecto
2. Crear una rama feature (`git checkout -b feature/AmazingFeature`)
3. Commit los cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

Para soporte y preguntas:
- 📧 Email: soporte@radiopwa.com
- 📱 Discord: Radio PWA Community
- 📚 Documentation: [Wiki del Proyecto](https://github.com/grupotrabullagency/Radio-pwa/wiki)

## 🎵 Demo

Visita la demo en vivo: [https://radio-pwa-demo.netlify.app](https://radio-pwa-demo.netlify.app)

---

**Desarrollado con ❤️ para la comunidad de radio online**
