document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('renderOption').addEventListener('change', function () {
        const selectedValue = this.value;
        document.getElementById("quranInputs").style.display = selectedValue === "quran" ? "block" : "none";
        document.getElementById("surahInput").style.display = selectedValue === "surah" ? "block" : "none";
        document.getElementById("symbolInput").style.display = selectedValue === "symbol" ? "block" : "none";
    });

    document.getElementById('renderBtn').addEventListener('click', function () {
        const canvas = document.getElementById("glyphCanvas");
        const ctx = canvas.getContext("2d");

        // Set canvas dimensions based on input values or use default values
        let dpi = window.devicePixelRatio || 1;
        const canvasWidthInput = document.getElementById("canvasWidth").value;
        const canvasHeightInput = document.getElementById("canvasHeight").value;

        const canvasWidth = canvasWidthInput ? parseInt(canvasWidthInput) : 1500; // Default width
        const canvasHeight = canvasHeightInput ? parseInt(canvasHeightInput) : 500; // Default height

        canvas.width = canvasWidth * dpi;  // Adjust canvas size for high-DPI screens
        canvas.height = canvasHeight * dpi;
        canvas.style.width = `${canvasWidth}px`;  // Set the CSS width (visible size)
        canvas.style.height = `${canvasHeight}px`;
        ctx.scale(dpi, dpi);  // Scale the context for high-DPI

        // Clear the canvas to ensure a transparent background
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas for transparency

        // Get the glyph input based on the selected option
        const selectedOption = document.getElementById("renderOption").value;
        let glyphs = '';
        let fontPath = '';
        const colorOption = document.getElementById("colorOption").value;

        if (selectedOption === "quran") {
            const fontNumber = document.getElementById("fontNumber").value.padStart(3, '0'); // Add leading zeros
            glyphs = document.getElementById("glyphInput").value;
            fontPath = `fonts/${colorOption}/QCF4${fontNumber}_COLOR-Regular.ttf`;
        } else if (selectedOption === "surah") {
            const glyphSurah = document.getElementById("glyphSurah").value.padStart(3, '0'); // Add leading zeros
            glyphs = glyphSurah;
            fontPath = `fonts/${colorOption}/QCF_FullSurah-Regular.ttf`;
        } else if (selectedOption === "symbol") {
            glyphs = document.getElementById("symbolOption").value;
            fontPath = `fonts/${colorOption}/QCF4001_COLOR-Regular.ttf`;
        }

        // Load the selected font
        const newFont = new FontFace('QuranFont', `url(${fontPath})`);
        newFont.load().then(function (loadedFont) {
            document.fonts.add(loadedFont);

            // Set initial font properties
            let fontSize = 120;
            let lineHeight = fontSize + 95; // Adjust this value for more or less line spacing
            ctx.font = `${fontSize}px 'QuranFont'`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "white"; // Set text color

            // Word wrap logic
            const maxWidth = canvasWidth * dpi;
            const words = glyphs.split(' ');
            const lines = [];
            let currentLine = '';
            const padding = 10; // Padding between lines

            words.forEach((word) => {
                const testLine = currentLine + word + ' ';
                const metrics = ctx.measureText(testLine);
                const testWidth = metrics.width;

                if (testWidth > maxWidth && currentLine) {
                    lines.push(currentLine);
                    currentLine = word + ' ';
                } else {
                    currentLine = testLine;
                }
            });
            lines.push(currentLine); // Add the last line

            // Calculate vertical positioning
            const totalHeight = lines.length * lineHeight; // Total height of all lines
            const startY = (canvas.height / dpi - totalHeight) / 2; // Center vertically, leaving space for lineHeight above and below

            // Render each line to the canvas with additional padding
            lines.forEach((line, index) => {
                ctx.fillText(line.trim(), (canvas.width / dpi) / 2, startY + (index * lineHeight) + (lineHeight / 2));
            });

            // Show save button
            document.getElementById("saveBtn").style.display = "inline-block";
        }).catch(function (error) {
            console.error("Error loading font:", error);
        });
    });

    // Save the canvas as a PNG file
    document.getElementById('saveBtn').addEventListener('click', function () {
        const canvas = document.getElementById("glyphCanvas");
        const link = document.createElement('a');
        link.download = 'quran_glyph.png';
        link.href = canvas.toDataURL('image/png', 1.0); // Ensure PNG format with full quality
        link.click();
    });

    // Replace '/' with space in glyphInput
    document.getElementById("glyphInput").addEventListener("input", function () {
        this.value = this.value.replace(/\//g, '\u00A0');
    });
});
