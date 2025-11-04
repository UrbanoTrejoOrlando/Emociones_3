// === Cargar historial de imágenes ===
async function cargarHistorial() {
    try {
        const response = await fetch('/historico_imagenes');
        if (!response.ok) throw new Error('Error al cargar el historial');

        const result = await response.json();
        const historicoImagesDiv = document.getElementById('historicoImages');
        historicoImagesDiv.innerHTML = '';

        if (result.imagenes) {
            result.imagenes.forEach(imgUrl => {
                // Crear contenedor
                const imageContainer = document.createElement('div');
                imageContainer.classList.add('image-item');

                // Imagen
                const imgElement = document.createElement('img');
                imgElement.src = imgUrl;
                imgElement.dataset.imageUrl = imgUrl;
                imgElement.style.cursor = 'pointer';

                // Botón de eliminar
                const deleteButton = document.createElement('button');
                deleteButton.classList.add('delete-btn');
                deleteButton.innerHTML = '🗑️';
                deleteButton.dataset.imageUrl = imgUrl;

                // Estructura final
                imageContainer.appendChild(imgElement);
                imageContainer.appendChild(deleteButton);
                historicoImagesDiv.appendChild(imageContainer);

                // Eliminar imagen al presionar el botón
                deleteButton.addEventListener('click', () => {
                    eliminarImagen(imageContainer, imgUrl);
                });
            });
        }
    } catch (error) {
        console.error('Error al cargar historial:', error);
    }
}

// === Eliminar imagen con animación y confirmación ===
async function eliminarImagen(imageContainer, imageUrl) {
    Swal.fire({
        title: '¿Eliminar esta imagen?',
        text: 'No podrás recuperarla luego.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#e60000',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar'
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                const response = await fetch('/eliminar_imagen', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageUrl })
                });

                const res = await response.json();
                if (res.success) {
                    // Animación antes de eliminar
                    imageContainer.classList.add('fade-out');
                    setTimeout(() => imageContainer.remove(), 400);
                    Swal.fire('Eliminado', 'La imagen ha sido eliminada.', 'success');
                } else {
                    Swal.fire('Error', 'No se pudo eliminar la imagen.', 'error');
                }
            } catch (error) {
                console.error(error);
                Swal.fire('Error', 'Error al eliminar la imagen.', 'error');
            }
        }
    });
}

// === Reprocesar imagen desde historial ===
document.getElementById('historicoImages').addEventListener('click', (event) => {
    const img = event.target;
    if (img.tagName === 'IMG' && img.dataset.imageUrl) {
        reprocesarImagen(img.dataset.imageUrl);
    }
});

async function reprocesarImagen(imageUrl) {
    try {
        const response = await fetch('/reprocesar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl }),
        });

        if (!response.ok) throw new Error('Error al reprocesar imagen');
        const result = await response.json();

        if (result.images) {
            document.getElementById('originalImage').src = imageUrl + '?t=' + new Date().getTime();
            const processedImagesDiv = document.getElementById('processedImages');
            processedImagesDiv.innerHTML = '';

            result.images.forEach(img => {
                const imgElement = document.createElement('img');
                imgElement.src = img + '?t=' + new Date().getTime();
                imgElement.style.maxWidth = '100%';
                processedImagesDiv.appendChild(imgElement);
            });
        }
    } catch (error) {
        console.error('Error al reprocesar:', error);
    }
}

// === Subir nueva imagen ===
const form = document.getElementById('uploadForm');
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('image', document.getElementById('image').files[0]);

    try {
        const response = await fetch('/upload', { method: 'POST', body: formData });
        if (!response.ok) throw new Error('Error al subir imagen');
        const result = await response.json();

        if (result.images) {
            document.getElementById('originalImage').src = result.images[0] + '?t=' + new Date().getTime();
            const processedImagesDiv = document.getElementById('processedImages');
            processedImagesDiv.innerHTML = '';

            result.images.slice(1).forEach(img => {
                const imgElement = document.createElement('img');
                imgElement.src = img + '?t=' + new Date().getTime();
                imgElement.style.maxWidth = '100%';
                processedImagesDiv.appendChild(imgElement);
            });

            cargarHistorial();
        }
    } catch (error) {
        console.error('Error al subir la imagen:', error);
    }
});

// === Cargar historial al iniciar ===
window.onload = cargarHistorial;
