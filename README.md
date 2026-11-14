# Burger King Perú – App Móvil

Aplicación web y móvil (PWA / APK) de **Burger King Perú** diseñada para funcionar como una app nativa de celular: permite iniciar sesión, explorar el menú, personalizar hamburguesas, pagar pedidos, seguir al repartidor en vivo y canjear puntos (**Coronas**).

---

## Ver la App en Línea

Puedes abrir la aplicación directamente desde cualquier celular o computadora en:

- **Enlace oficial:** https://angelordaya-dev.github.io/BurgerKing-Peru-App/
- **Código en GitHub:** https://github.com/AngelOrdaya-Dev/BurgerKing-Peru-App

---

## ¿Cómo se usa la App? (10 Pantallas)

1. **Login y Bienvenida:** Pantalla inicial para ingresar con tu nombre, número de celular (`+51`), correo o accesos rápidos. Recuerda tu cuenta en el dispositivo.
2. **Inicio:** Pantalla principal con saludo personalizado, modalidad de entrega (*Delivery*, *Para Llevar* o *Auto-King*), promociones y acceso rápido a lo más pedido.
3. **Menú Digital:** Catálogo completo separado por categorías (*Todo el Menú*, *Hamburguesas de Res*, *Pollo & Crispy*, *Snacks & Papas*) con buscador y filtros.
4. **Personalizar ("A Tu Manera"):** Permite elegir tamaño de carne (*Simple*, *Doble*, *Triple*), ingredientes, adicionales (*Queso*, *Tocino*), agrandar a combo y dejar notas para cocina.
5. **Carrito / Bandeja:** Muestra los productos agregados, permite cambiar cantidades, aplicar cupones de descuento (como `BKBIENVENIDO20`) y ver el total.
6. **Checkout (Pago):** Selección de dirección, método de pago (**Yape / Plin**, **Tarjeta**, **Contra entrega**) y tipo de comprobante (**Boleta** o **Factura**).
7. **King Tracker (Seguimiento en Vivo):** Mapa interactivo de Miraflores (Lima) que muestra el recorrido del repartidor en tiempo real y el estado del pedido.
8. **Cupones:** Lista de descuentos y combos 2x1 listos para agregar al carrito.
9. **Club Coronas:** Muestra tus puntos acumulados y permite canjearlos por productos gratis.
10. **Mi Perfil:** Permite editar tus datos personales, administrar direcciones y tarjetas, contactar soporte por WhatsApp y acceder al Libro de Reclamaciones Virtual.

---

## ¿Qué hace cada archivo del proyecto?

| Archivo | Función |
| :--- | :--- |
| `index.html` | Contiene toda la estructura y las 10 pantallas de la aplicación. |
| `style.css` | Define los colores, tipografías, botones y el diseño adaptable a celular y PC. |
| `app.js` | Controla la navegación entre pantallas, carrito, cálculos, filtros y mapa en vivo. |
| `server.js` | Servidor local en Node.js para probar la app en tu computadora. |
| `manifest.json` | Configuración para que la app pueda instalarse en el celular como PWA o APK. |
| `sw.js` | Service Worker para guardar archivos básicos en caché y mejorar la carga. |
| `README.md` | Documentación principal del proyecto. |

---

## Cómo ejecutarlo en tu computadora

Necesitas tener instalado **Node.js**. Luego abre una terminal en la carpeta del proyecto y ejecuta:

```bash
node server.js
```

Después abre tu navegador en:

```text
http://localhost:3000
```

---

## Guía rápida para el equipo (Trabajo con Git y Ramas)

Para no sobrescribir el trabajo de los demás, cada integrante debe trabajar en su propia rama:

1. **Descargar el proyecto (solo la primera vez):**
   ```bash
   git clone https://github.com/AngelOrdaya-Dev/BurgerKing-Peru-App.git
   cd BurgerKing-Peru-App
   ```

2. **Actualizar tu copia antes de empezar a editar:**
   ```bash
   git checkout main
   git pull origin main
   ```

3. **Cambiar o crear tu rama personal:**
   ```bash
   git checkout -b tu-nombre
   ```

4. **Guardar y subir tus cambios a GitHub:**
   ```bash
   git add .
   git commit -m "Describe brevemente lo que cambiaste"
   git push -u origin tu-nombre
   ```

5. **Unir a `main`:** En GitHub aparecerá el botón **Compare & pull request** para revisar los cambios e integrarlos a la rama principal (`main`).
