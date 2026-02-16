import sys

path = '/Users/diego/Desktop/IA/ProjetoNutixoApp/src/pages/Progress.jsx'
with open(path, 'r') as f:
    lines = f.readlines()

start_idx = -1
end_idx = -1

for i, line in enumerate(lines):
    if '{[' in line and 'weight' in line:
        # Check if it looks like the start of our array
        pass
    if '{[' in line and i < len(lines)-1 and 'key:' in lines[i+1]:
        start_idx = i
    if 'filter(Boolean)}' in line and i > start_idx and start_idx != -1:
        end_idx = i
        # Make sure it's the first one after start_idx
        break

if start_idx != -1 and end_idx != -1:
    print(f"Replacing lines {start_idx+1} to {end_idx+1}")
    new_lines = lines[:start_idx] + ["""                                        {(() => {
                                            if (!measurements.length) return null;
                                            const latest = measurements[0];
                                            const data = latest.analysis?.measurements || latest.analysis;
                                            if (!data) return null;

                                            const keys = Object.keys(data).filter(k => 
                                                !['summary', 'recommendations', 'bmi', 'goal', 'previousInjuries', 'trainingDuration', 'trainingFrequency', 'sportsHistory', 'performanceIndicators'].includes(k)
                                            );

                                            return keys.map((key, i) => {
                                                const trendData = getMeasurementTrend(key);
                                                const lastVal = trendData[trendData.length - 1];
                                                const meta = {
                                                    weight: { label: 'Peso', icon: Scale, color: '#10b981' },
                                                    bodyFat: { label: 'Gordura corporal', icon: Activity, color: '#8b5cf6' },
                                                    muscleMass: { label: 'Massa Magra', icon: Zap, color: '#3b82f6' },
                                                    imc: { label: 'IMC', icon: Target, color: '#6366f1' },
                                                };
                                                
                                                const entry = meta[key] || { 
                                                    label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                                                    icon: Activity, 
                                                    color: '#94a3b8' 
                                                };

                                                return (
                                                    <SentinelCard
                                                        key={key}
                                                        label={entry.label}
                                                        value={lastVal?.value}
                                                        unit={lastVal?.unit || ''}
                                                        trend={lastVal ? 'Detectado' : 'Estável'}
                                                        status="success"
                                                        color={entry.color}
                                                        icon={entry.icon}
                                                        date={latest.created_at}
                                                        history={trendData}
                                                        delay={0.1 * i}
                                                        onClick={() => setSelectedMarker({ 
                                                            label: entry.label, 
                                                            value: lastVal?.value, 
                                                            unit: lastVal?.unit || '', 
                                                            history: trendData, 
                                                            date: latest.created_at 
                                                        })}
                                                    />
                                                );
                                            });
                                        })()}\n"""] + lines[end_idx+1:]
    with open(path, 'w') as f:
        f.writelines(new_lines)
else:
    print("Could not find block")
