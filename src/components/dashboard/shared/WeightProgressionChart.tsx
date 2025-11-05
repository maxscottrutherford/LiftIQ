import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ChartDataPoint {
  date: string;
  maxWeight: number;
  sessionDate: Date;
}

interface WeightProgressionChartProps {
  data: ChartDataPoint[];
}

export function WeightProgressionChart({ data }: WeightProgressionChartProps) {
  if (data.length === 0) return null;

  return (
    <Card className="min-w-0">
      <CardHeader>
        <CardTitle className="text-center">Max Weight Over Time</CardTitle>
      </CardHeader>
      <CardContent className="px-4 sm:px-6 space-y-6">
        <div className="w-full h-[250px] sm:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="date" 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis 
                label={{ value: 'Weight (lbs)', angle: -90, position: 'insideLeft' }}
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '0.5rem'
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="maxWeight" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: 'hsl(var(--primary))', r: 4 }}
                name="Max Weight (lbs)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

