import { useEffect, useState, useMemo, useCallback } from "react";

interface EncryptTypes {
    text: string;
    HTMLtag: keyof JSX.IntrinsicElements;
    encryptInView: boolean;
    iterationsRange?: number;
    encryptInterval?: number;
    className: string;
}

export default function EncryptText({
    text,
    HTMLtag,
    encryptInView,
    iterationsRange = 3,
    encryptInterval = 20,
    className,
}: EncryptTypes) {
    const symbols = [
        "!", "@", "#", "$", "%", "^", "&", "*", ">", "<", "/", "?", ":", ";", "~"
    ];
    iterationsRange = Math.max(iterationsRange, 0);
    const getRandomSymbol = () =>
        symbols[Math.floor(Math.random() * symbols.length)];

    const placeholder = useMemo(
        () => Array.from({ length: text.length }, getRandomSymbol),
        [text]
    );

    const [displayText, setDisplayText] = useState<string[]>(placeholder);

    useEffect(() => {
        setDisplayText(placeholder);
    }, [placeholder]);

    useEffect(() => {
        if (!encryptInView) return;

        let i = 0;
        let iterations = 0;

        const id = setInterval(() => {
            setDisplayText(prev => {
                const next = [...prev];

                for (let j = i; j < text.length; j++) {
                    next[j] = getRandomSymbol();
                }

                if (iterations === iterationsRange) {
                    next[i] = text[i];
                    i++;
                    iterations = 0;
                } else {
                    iterations++;
                }

                if (i >= text.length) {
                    clearInterval(id);
                }

                return next;
            });
        }, encryptInterval);
        return () => clearInterval(id);

    }, [encryptInView, text, iterationsRange, encryptInterval,]);

    return (
        <HTMLtag className={className}>
            {displayText.join("")}
        </HTMLtag>
    );
}
