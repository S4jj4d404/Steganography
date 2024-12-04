const imageInput = document.getElementById('imageInput');
const messageInput = document.getElementById('messageInput');
const embedButton = document.getElementById('embedButton');
const extractButton = document.getElementById('extractButton');
const canvas = document.getElementById('canvas');
const output = document.getElementById('output');

// Embed Message into Image
const embedMessage = () => {
    const file = imageInput.files[0];
    if (!file || !messageInput.value) {
        alert('Please upload an image and enter a message.');
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;

            const message = messageInput.value + '\u0000'; // Null terminator
            let msgIndex = 0;

            for (let i = 0; i < data.length && msgIndex < message.length; i += 4) {
                const charCode = message.charCodeAt(msgIndex);
                data[i] = (data[i] & 0xFC) | ((charCode >> 6) & 0x03); // Store 2 bits
                data[i + 1] = (data[i + 1] & 0xFC) | ((charCode >> 4) & 0x03); 
                data[i + 2] = (data[i + 2] & 0xFC) | ((charCode >> 2) & 0x03); 
                data[i + 3] = (data[i + 3] & 0xFC) | (charCode & 0x03);
                msgIndex++;
            }

            ctx.putImageData(imgData, 0, 0);

            canvas.toBlob((blob) => {
                const link = document.createElement('a');
                link.href = URL.createObjectURL(blob);
                link.download = 'bojjad_image.png';
                link.click();
            });
        };
        img.src = reader.result;
    };
    reader.readAsDataURL(file);
};

// Extract Message from Image
const extractMessage = () => {
    const file = imageInput.files[0];
    if (!file) {
        alert('Please upload an image to extract the message.');
        return;
    }

    const reader = new FileReader();
    reader.onload = () => {
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);

            const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imgData.data;

            let message = '';
            for (let i = 0; i < data.length; i += 4) {
                const charCode = ((data[i] & 0x03) << 6) |
                                 ((data[i + 1] & 0x03) << 4) |
                                 ((data[i + 2] & 0x03) << 2) |
                                 (data[i + 3] & 0x03);
                if (charCode === 0) break; // Null terminator
                message += String.fromCharCode(charCode);
            }

            output.textContent = `Extracted Message: ${message}`;
        };
        img.src = reader.result;
    };
    reader.readAsDataURL(file);
};

embedButton.addEventListener('click', embedMessage);
extractButton.addEventListener('click', extractMessage);

function toggleDetails() {
    const details = document.getElementById('how-to-work-details');
    details.classList.toggle('hidden');
}
