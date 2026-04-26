import { useState, useEffect } from 'react';

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