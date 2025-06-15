
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Brain, 
  Zap, 
  Activity, 
  Clock, 
  HardDrive, 
  Cpu, 
  TrendingUp,
  Settings,
  Play,
  Square,
  RotateCcw
} from "lucide-react";

interface ModelMetrics {
  tokensPerSecond: number;
  latency: number;
  memoryUsage: number;
  cpuUsage: number;
  accuracy: number;
  loss: number;
  contextWindow: number;
  batchSize: number;
}

interface TrainingConfig {
  model: string;
  quantization: 'none' | '4bit' | '8bit' | '16bit';
  maxTokens: number;
  temperature: number;
  topP: number;
  topK: number;
  contextLength: number;
  batchSize: number;
  learningRate: number;
  enableKVCache: boolean;
  enableGradientCheckpointing: boolean;
  optimizerType: 'adam' | 'adamw' | 'sgd';
}

interface XPModelTrainingDashboardProps {
  llmConfig: any;
  onConfigUpdate: (config: TrainingConfig) => void;
}

export function XPModelTrainingDashboard({ llmConfig, onConfigUpdate }: XPModelTrainingDashboardProps) {
  const [isTraining, setIsTraining] = useState(false);
  const [metrics, setMetrics] = useState<ModelMetrics>({
    tokensPerSecond: 0,
    latency: 0,
    memoryUsage: 0,
    cpuUsage: 0,
    accuracy: 0,
    loss: 0,
    contextWindow: 2048,
    batchSize: 1
  });

  const [trainingConfig, setTrainingConfig] = useState<TrainingConfig>({
    model: llmConfig?.model || 'codellama',
    quantization: '4bit',
    maxTokens: 2048,
    temperature: 0.7,
    topP: 0.9,
    topK: 40,
    contextLength: 4096,
    batchSize: 1,
    learningRate: 0.0001,
    enableKVCache: true,
    enableGradientCheckpointing: false,
    optimizerType: 'adamw'
  });

  const [trainingHistory, setTrainingHistory] = useState<any[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isTraining) {
      interval = setInterval(() => {
        // Simulate real-time metrics updates
        setMetrics(prev => ({
          ...prev,
          tokensPerSecond: Math.floor(Math.random() * 50) + 20,
          latency: Math.floor(Math.random() * 100) + 50,
          memoryUsage: Math.floor(Math.random() * 30) + 40,
          cpuUsage: Math.floor(Math.random() * 40) + 30,
          accuracy: Math.min(prev.accuracy + (Math.random() * 0.5), 95),
          loss: Math.max(prev.loss - (Math.random() * 0.1), 0.1)
        }));
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTraining]);

  const startTraining = () => {
    setIsTraining(true);
    setMetrics(prev => ({ ...prev, accuracy: 60, loss: 2.5 }));
    onConfigUpdate(trainingConfig);
  };

  const stopTraining = () => {
    setIsTraining(false);
    setTrainingHistory(prev => [...prev, {
      timestamp: new Date(),
      config: trainingConfig,
      finalMetrics: metrics
    }]);
  };

  const resetMetrics = () => {
    setMetrics({
      tokensPerSecond: 0,
      latency: 0,
      memoryUsage: 0,
      cpuUsage: 0,
      accuracy: 0,
      loss: 0,
      contextWindow: trainingConfig.contextLength,
      batchSize: trainingConfig.batchSize
    });
  };

  const optimizeForInference = () => {
    setTrainingConfig(prev => ({
      ...prev,
      quantization: '4bit',
      enableKVCache: true,
      batchSize: 1,
      contextLength: 2048,
      temperature: 0.3
    }));
  };

  return (
    <div className="space-y-4">
      <Card className="border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Real-Time Model Training Dashboard
            <Badge variant={isTraining ? "default" : "secondary"}>
              {isTraining ? "Training Active" : "Idle"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-600" />
                  <div>
                    <p className="text-2xl font-bold">{metrics.tokensPerSecond}</p>
                    <p className="text-xs text-muted-foreground">Tokens/sec</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold">{metrics.latency}ms</p>
                    <p className="text-xs text-muted-foreground">Latency</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold">{metrics.memoryUsage}%</p>
                    <p className="text-xs text-muted-foreground">Memory</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-red-600" />
                  <div>
                    <p className="text-2xl font-bold">{metrics.cpuUsage}%</p>
                    <p className="text-xs text-muted-foreground">CPU Usage</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <Label className="text-sm font-medium mb-2 block">Model Accuracy</Label>
              <Progress value={metrics.accuracy} className="mb-2" />
              <p className="text-xs text-muted-foreground">{metrics.accuracy.toFixed(1)}%</p>
            </div>
            <div>
              <Label className="text-sm font-medium mb-2 block">Training Loss</Label>
              <Progress value={Math.max(0, 100 - (metrics.loss * 20))} className="mb-2" />
              <p className="text-xs text-muted-foreground">{metrics.loss.toFixed(3)}</p>
            </div>
          </div>

          <div className="flex gap-2 mb-6">
            {!isTraining ? (
              <Button onClick={startTraining} className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Start Training
              </Button>
            ) : (
              <Button onClick={stopTraining} variant="destructive" className="flex items-center gap-2">
                <Square className="w-4 h-4" />
                Stop Training
              </Button>
            )}
            <Button onClick={resetMetrics} variant="outline" className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4" />
              Reset Metrics
            </Button>
            <Button onClick={optimizeForInference} variant="secondary" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Optimize for Speed
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quantization">Quantization</Label>
              <Select 
                value={trainingConfig.quantization} 
                onValueChange={(value: any) => setTrainingConfig(prev => ({ ...prev, quantization: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None (FP32)</SelectItem>
                  <SelectItem value="16bit">16-bit</SelectItem>
                  <SelectItem value="8bit">8-bit</SelectItem>
                  <SelectItem value="4bit">4-bit (Fastest)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="batchSize">Batch Size</Label>
              <Input
                id="batchSize"
                type="number"
                value={trainingConfig.batchSize}
                onChange={(e) => setTrainingConfig(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))}
                min="1"
                max="32"
              />
            </div>

            <div>
              <Label htmlFor="contextLength">Context Length</Label>
              <Select 
                value={trainingConfig.contextLength.toString()} 
                onValueChange={(value) => setTrainingConfig(prev => ({ ...prev, contextLength: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1024">1024 (Fast)</SelectItem>
                  <SelectItem value="2048">2048 (Balanced)</SelectItem>
                  <SelectItem value="4096">4096 (Quality)</SelectItem>
                  <SelectItem value="8192">8192 (Max)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="kvCache">KV Cache</Label>
              <Switch
                id="kvCache"
                checked={trainingConfig.enableKVCache}
                onCheckedChange={(checked) => setTrainingConfig(prev => ({ ...prev, enableKVCache: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="gradientCheckpointing">Gradient Checkpointing</Label>
              <Switch
                id="gradientCheckpointing"
                checked={trainingConfig.enableGradientCheckpointing}
                onCheckedChange={(checked) => setTrainingConfig(prev => ({ ...prev, enableGradientCheckpointing: checked }))}
              />
            </div>

            <div>
              <Label htmlFor="optimizer">Optimizer</Label>
              <Select 
                value={trainingConfig.optimizerType} 
                onValueChange={(value: any) => setTrainingConfig(prev => ({ ...prev, optimizerType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="adam">Adam</SelectItem>
                  <SelectItem value="adamw">AdamW (Recommended)</SelectItem>
                  <SelectItem value="sgd">SGD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {trainingHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Training History
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {trainingHistory.slice(-5).map((session, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <div>
                    <p className="text-sm font-medium">
                      {session.timestamp.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Final Accuracy: {session.finalMetrics.accuracy.toFixed(1)}% | 
                      Speed: {session.finalMetrics.tokensPerSecond} t/s
                    </p>
                  </div>
                  <Badge variant="outline">{session.config.quantization}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
