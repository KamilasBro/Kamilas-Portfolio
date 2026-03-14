import { useEffect, useState, useCallback, useMemo } from "react";

interface EncryptTypes {
    text: string;
    HTMLtag: keyof JSX.IntrinsicElements;
    encryptInView: boolean;
    iterationsRange?: number;
    decryptInterval?: number;
    className: string;
}

// Component renders text that initially appears encrypted
// and gradually decrypts when `encryptInView` becomes true
export default function DecryptText({
    text,
    HTMLtag,
    className,
    encryptInView,
    iterationsRange = 3,
    decryptInterval = 20,
}: EncryptTypes) {

    // Symbols used to simulate encrypted characters
    // useMemo ensures the array reference stays stable between renders.
    // Without this, React would create a new array each render,
    // which would also recreate dependent callbacks.
    const symbols = useMemo(() => {
        return [
            "!", "@", "#", "$", "%", "^", "&", "*", ">", "<", "/", "?", ":", ";", "~"
        ]
    }, [])

    // Returns a random symbol from the symbols array
    // useCallback keeps the function reference stable so it can safely
    // be used inside useEffect dependencies without causing re-execution
    // on every render.
    const getRandomSymbol = useCallback(() => {
        return symbols[Math.floor(Math.random() * symbols.length)]
    }, [symbols]);

    // State storing the currently visible characters
    // We initialize with random symbols so the layout width matches the final text.
    // The initializer function runs only once (on mount).
    const [displayText, setDisplayText] = useState<string[]>(() =>
        Array.from({ length: text.length }, getRandomSymbol)
    );

    useEffect(() => {
        if (!encryptInView) return;

        let i = 0;
        //current number of rerolls before revealing a character
        let iterations = 0;

        // Interval drives the animation loop
        const id = setInterval(() => {

            setDisplayText(prev => {
                const next = [...prev];

                // Randomize all characters after the current reveal index
                for (let j = i; j < text.length; j++) {
                    next[j] = getRandomSymbol();
                }

                // After enough rerolls, reveal the correct character
                if (iterations === iterationsRange) {
                    next[i] = text[i];
                    i++;
                    iterations = 0;
                } else {
                    iterations++;
                }

                // Stop animation once all characters are revealed
                if (i >= text.length) {
                    clearInterval(id);
                }

                return next;
            });

        }, decryptInterval);
        return () => clearInterval(id);

    }, [encryptInView, text, iterationsRange, decryptInterval, getRandomSymbol]);

    return (
        <HTMLtag className={className}>
            {displayText.join("")}
        </HTMLtag>
    );
}