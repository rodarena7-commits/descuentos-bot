# 🎁 Descuentos Bot - Argentina

Bot de WhatsApp que busca y notifica los mejores descuentos disponibles en Argentina.

## 🎯 Características

### 1. Canal WhatsApp Business
- Envía automáticamente las últimas actualizaciones de descuentos
- Notificaciones en tiempo real de nuevas promociones
- Organizado por categoría y banco

### 2. Bot Interactivo
- Usuarios escriben a **+5491176634364**
- El bot pregunta:
  - ¿Dónde estás ubicado?
  - ¿Dónde quieres comprar?
  - ¿Qué te conviene?
  - ¿Qué quieres comprar?
  - ¿Qué medios de pago tienes?
  - ¿Cuál es tu tope de reintegro?
- Sugiere descuentos personalizados basado en el perfil

### 3. Scraping de Descuentos
Busca descuentos en:
- 🏦 Todos los bancos (BBVA, Santander, Galicia, etc.)
- 💳 Mercado Pago
- 📦 Mercado Libre
- 🍋 Lemon
- 📱 Cuenta DNI
- 💱 Rippio
- 🚀 Astropay
- 💰 Personal Pay
- Y más...

### 4. Información Mostrada
Cada descuento incluye:
- 📊 Descuento (%, monto, cashback)
- 🏷️ Categoría / Banco
- ⏰ Validez (fecha de vencimiento)
- ✅ Requisitos

## 📋 Requisitos

- Node.js 18+
- npm o yarn
- WhatsApp Business Account
- Conexión a internet

## 🚀 Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/rodarena7-commits/descuentos-bot.git
cd descuentos-bot
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus valores
```

4. Iniciar el bot:
```bash
npm start
# O en desarrollo:
npm run dev
```

## 📁 Estructura del Proyecto

```
descuentos-bot/
├── scrapers/
│   ├── bancos.js
│   ├── mercadopago.js
│   ├── mercadolibre.js
│   ├── lemon.js
│   ├── cuenta-dni.js
│   ├── rippio.js
│   ├── astropay.js
│   ├── personalpay.js
│   └── index.js
├── utils/
│   ├── logger.js
│   ├── validators.js
│   └── formatters.js
├── data/
│   └── descuentos.json
├── server.js
├── package.json
├── .env.example
└── README.md
```

## 🔄 Flujo de Trabajo

### Canal de Notificaciones
1. Scrapers obtienen descuentos cada X horas
2. Se comparan con descuentos previos
3. Si hay nuevos, se envían al canal WhatsApp

### Bot Interactivo
1. Usuario escribe al número del bot
2. Bot recopila información en conversación
3. Filtra descuentos según:
   - Ubicación
   - Medio de pago
   - Categoría de compra
   - Tope de reintegro
4. Responde con opciones personalizadas

## 🛠️ Desarrollo

Para agregar un nuevo scraper:
1. Crear archivo en `scrapers/` (ej: `nuevaplatforma.js`)
2. Exportar función que retorne array de descuentos
3. Importar en `scrapers/index.js`

Formato de descuento:
```javascript
{
  id: "banco-promo-001",
  banco: "Banco X",
  descuento: "20%",
  monto: "$5000",
  cashback: "10%",
  categoria: "Supermercados",
  validoHasta: "2026-05-31",
  requisitos: "Compra mínima $1000",
  url: "https://...",
  fechaActualizacion: "2026-05-08"
}
```

## 📝 Variables de Entorno

Ver `.env.example` para más detalles

## 📞 Contacto

Para soporte o sugerencias: [contacto]

---
**Creado con ❤️ para Argentina**
