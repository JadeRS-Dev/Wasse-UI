import { FC, useState, useEffect } from 'react';
import { Base, Column, LayoutProgressBar, Text } from '../../common';

interface LoadingViewProps {
    isError: boolean;
    message: string;
    percent: number;
}

export const LoadingView: FC<LoadingViewProps> = props => {
    const { isError = false, message = '', percent = 0 } = props;
    const [loadingText, setLoadingText] = useState("El hotel está cargando"); // Texto inicial

    useEffect(() => {
        const intervalId = setInterval(() => {
            const texts = [
                "No eres tú, soy yo...",
                "El hotel está cargando...",
                "Eres muy travies@, ya casi estamos...",
                "¡Tienes muy poca paciencia! ¿Verdad?...",
                "¡Ya casi está listo monstruito!..."
            ];
            const randomIndex = Math.floor(Math.random() * texts.length);
            setLoadingText(texts[randomIndex]);
        }, 3000);

        return () => clearInterval(intervalId);
    }, []);

    return (
        <Column fullHeight position="relative" className="nitro-loading">
            <Base fullHeight className="container h-100">
                <Column fullHeight alignItems="center" justifyContent="end">
                    <Base className="connecting-duck" />
                    <Column size={4} className="text-center progress-connection">
                        {isError && (message && message.length) ?
                            <Base className="fs-4 text-shadow">{message}</Base>
                            :
                            <>
                                <Text fontSize={4} variant="white" className="text-shadow">{loadingText}</Text>
                                <LayoutProgressBar progress={percent} className="mt-2 large" />
                                <div style={{ color: '#a4a4a4', fontSize: '18px' }}>{percent.toFixed()}%...</div>
                            </>
                        }

                    </Column>
                </Column>
            </Base>
        </Column>
    );
}
