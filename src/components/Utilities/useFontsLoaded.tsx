import { useState, useEffect } from 'react';

//Tech Stack paths were slightly mismatched due to font not loading at time
//so now we check if font is loaded

export default function useFontsLoaded() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        async function checkFonts() {
            if ("fonts" in document) {
                try {
                    await document.fonts.ready;
                } catch {}
            }
            setLoaded(true);
        }

        checkFonts();
    }, []);

    return loaded;
}