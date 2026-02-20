import { useState, useEffect } from 'react';

export default function useFontsLoaded() {
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        let cancelled = false;

        async function checkFonts() {
            if ("fonts" in document) {
                try {
                    await document.fonts.ready;
                } catch { }
            }

            if (!cancelled) {
                setLoaded(true);
            }
        }

        checkFonts();

        return () => {
            cancelled = true;
        };
    }, []);

    return loaded;
}