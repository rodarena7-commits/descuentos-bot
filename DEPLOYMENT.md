# 🚀 Despliegue en Render

## ¿Por qué Render se pausa?

Render pausa los servicios **Free** después de 15 minutos sin tráfico HTTP. Como este bot es solo WhatsApp (sin endpoint HTTP), necesitamos mantenerlo activo.

## ✅ Solución: Webhook HTTP que hace Ping

### 1. Desplegar en Render

**Paso 1:** Ve a [render.com](https://render.com)

**Paso 2:** Haz click en **"New +"** → **"Web Service"**

**Paso 3:** Llena el formulario:

| Campo | Valor |
|-------|-------|
| **Repository** | `https://github.com/tu-usuario/descuentos-bot.git` |
| **Name** | `descuentos-bot` |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `npm start` |
| **Plan** | Free (la solución del ping evita la pausa) |

**Paso 4:** Agrega Variables de Entorno:

```
NUMERO_BOT=5491176634364@s.whatsapp.net
NUMERO_DUENO=541123484720@s.whatsapp.net
NODE_ENV=production
```

**Paso 5:** Deploy ✅

---

### 2. Mantener el servicio activo (sin pausa)

Una vez deployado en Render, obtendrás una URL como:
```
https://descuentos-bot-abcd.onrender.com
```

**Opción A: Usar Uptime Robot (GRATIS)**

1. Ve a [uptimerobot.com](https://uptimerobot.com)
2. Haz click en **"+ Add Monitor"**
3. Configura:
   - **Monitor Type:** HTTP(s)
   - **URL:** `https://descuentos-bot-abcd.onrender.com/health`
   - **Interval:** 5 minutos
   - **Alert Contacts:** Tu email

4. ¡Listo! Uptime Robot hará ping cada 5 minutos → el servicio nunca se pausará

**Opción B: Usar CronJob.org (GRATIS)**

1. Ve a [cron-job.org](https://cron-job.org)
2. Crea una URL:
   - **URL:** `https://descuentos-bot-abcd.onrender.com/health`
   - **Interval:** Cada 10 minutos

---

### 3. Verificar que funciona

```bash
# Verificar que el servidor HTTP responde
curl https://descuentos-bot-abcd.onrender.com/health

# Respuesta esperada:
# {"status":"✅ Bot activo","timestamp":"2026-05-08T..."}
```

---

## 🔍 Endpoint disponibles

- `GET /` → Info del bot
- `GET /health` → Estado del servicio

---

## 📝 Notas importantes

✅ El bot ahora tiene **servidor HTTP integrado**
✅ Se mantendrá activo **24/7** con el ping automático
✅ No necesitas plan pagado
✅ El webhook HTTP no interfiere con WhatsApp

---

## Próximos pasos

1. Haz commit de los cambios
2. Sube a GitHub
3. Deploya en Render
4. Configura Uptime Robot o CronJob.org
5. ¡Listo! Bot corriendo 24/7
