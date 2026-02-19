export function createNotification({
    title,
    description,
    type = 'system',
    target = null,
    read = false,
}) {
    return {
        id: Date.now() + Math.floor(Math.random() * 10000),
        title,
        description,
        type,
        target,
        time: 'agora',
        read,
    };
}

export function pushNotification(notification) {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
        new CustomEvent('nutrixo:add-notification', {
            detail: notification,
        })
    );
}

export function buildImportStageNotification(kind, stage) {
    const kindPossessive = kind === 'exams' ? 'seu Exame' : kind === 'measurements' ? 'suas Medidas' : 'seu Plano';
    const map = {
        queued: {
            title: 'Análise em andamento',
            description: `O sistema está processando ${kindPossessive}.`,
        },
        completed: {
            title: 'Análise finalizada',
            description: `O sistema finalizou com sucesso ${kindPossessive}.`,
        },
        failed: {
            title: 'Análise finalizada com erro',
            description: `O sistema finalizou com erro ${kindPossessive}.`,
        },
    };

    const entry = map[stage] || {
        title: 'Atualização de análise',
        description: `O sistema atualizou o status de ${kindPossessive} (${stage}).`,
    };

    const target = kind === 'exams' ? '/labs' : kind === 'measurements' ? '/measurements' : '/nutrition-plan';
    return createNotification({
        ...entry,
        type: 'labs',
        target,
    });
}
