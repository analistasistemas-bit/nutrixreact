export const examHistory = [
    {
        id: 1,
        date: "14/01/2024",
        status: "Atenção",
        optimal: 2,
        attention: 1,
        improve: 1
    },
    {
        id: 2,
        date: "19/10/2023",
        status: "Ótimo",
        optimal: 3,
        attention: 1,
        improve: 0
    },
    {
        id: 3,
        date: "09/07/2023",
        status: "Melhorar",
        optimal: 1,
        attention: 2,
        improve: 1
    }
];

export const biomarkerTrends = [
    {
        id: 1,
        name: "Colesterol Total",
        reference: "< 200 mg/dL",
        current: "210 mg/dL",
        trend: "Melhorando",
        values: [
            { value: 230, date: "2023-07" },
            { value: 215, date: "2023-10" },
            { value: 210, date: "2024-01" }
        ]
    },
    {
        id: 2,
        name: "Glicose",
        reference: "< 100 mg/dL",
        current: "95 mg/dL",
        trend: "Estável",
        values: [
            { value: 98, date: "2023-07" },
            { value: 96, date: "2023-10" },
            { value: 95, date: "2024-01" }
        ]
    },
    {
        id: 3,
        name: "Hemoglobina",
        reference: "12-16 g/dL",
        current: "14.2 g/dL",
        trend: "Ótimo",
        values: [
            { value: 13.8, date: "2023-07" },
            { value: 14.0, date: "2023-10" },
            { value: 14.2, date: "2024-01" }
        ]
    }
];
