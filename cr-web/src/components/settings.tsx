import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Settings, Download, Zap, Brain } from "lucide-react"

interface AISettings {
  temperature: number
  maxTokens: number
  topP: number
  model: string
}

interface SettingsProps {
  children?: React.ReactNode
}

export function SettingsPanel({ children }: SettingsProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [aiSettings, setAISettings] = useState<AISettings>({
    temperature: 0.7,
    maxTokens: 2048,
    topP: 0.9,
    model: "claude-3-5-sonnet-latest"
  })

  const handleTriggerImport = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/repo/trigger-import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (response.ok) {
        alert('GitHub Trend 预获取已触发成功！')
      } else {
        alert('触发失败，请稍后重试')
      }
    } catch (error) {
      console.error('Error triggering import:', error)
      alert('触发失败，请检查网络连接')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveSettings = () => {
    // 保存设置到 localStorage 或发送到服务器
    localStorage.setItem('aiSettings', JSON.stringify(aiSettings))
    alert('设置已保存！')
    setOpen(false)
  }

  const handleResetSettings = () => {
    setAISettings({
      temperature: 0.7,
      maxTokens: 2048,
      topP: 0.9,
      model: "claude-3-5-sonnet-latest"
    })
  }

  // 从 localStorage 加载设置
  React.useEffect(() => {
    const savedSettings = localStorage.getItem('aiSettings')
    if (savedSettings) {
      try {
        setAISettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error('Error loading settings:', error)
      }
    }
  }, [])

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            系统设置
          </DialogTitle>
          <DialogDescription>
            调整 AI 模型参数和管理 GitHub 数据获取
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* AI 参数设置 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI 模型参数
              </CardTitle>
              <CardDescription>
                调整 Anthropic Claude 模型的行为参数
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* 模型选择 */}
              <div className="space-y-2">
                <Label htmlFor="model">模型版本</Label>
                <Input
                  id="model"
                  value={aiSettings.model}
                  onChange={(e) => setAISettings(prev => ({ ...prev, model: e.target.value }))}
                  placeholder="claude-3-5-sonnet-latest"
                />
              </div>

              {/* 温度设置 */}
              <div className="space-y-2">
                <Slider
                  label="温度 (Temperature)"
                  value={aiSettings.temperature}
                  onChange={(value) => setAISettings(prev => ({ ...prev, temperature: value }))}
                  min={0}
                  max={2}
                  step={0.1}
                />
                <p className="text-xs text-muted-foreground">
                  控制回答的创造性。较低值更精确，较高值更有创意。
                </p>
              </div>

              {/* 最大令牌数 */}
              <div className="space-y-2">
                <Slider
                  label="最大令牌数 (Max Tokens)"
                  value={aiSettings.maxTokens}
                  onChange={(value) => setAISettings(prev => ({ ...prev, maxTokens: value }))}
                  min={100}
                  max={4096}
                  step={50}
                />
                <p className="text-xs text-muted-foreground">
                  限制AI回答的长度。更高的值允许更长的回答。
                </p>
              </div>

              {/* Top P 设置 */}
              <div className="space-y-2">
                <Slider
                  label="Top P"
                  value={aiSettings.topP}
                  onChange={(value) => setAISettings(prev => ({ ...prev, topP: value }))}
                  min={0}
                  max={1}
                  step={0.01}
                />
                <p className="text-xs text-muted-foreground">
                  控制词汇选择的多样性。较低值更保守，较高值更多样。
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleResetSettings}>
                  重置默认值
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* GitHub 数据管理 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                GitHub 数据管理
              </CardTitle>
              <CardDescription>
                手动触发 GitHub trending 仓库数据的获取和更新
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">手动数据更新</span>
                </div>
                <p className="text-sm text-muted-foreground mb-3">
                  手动触发 GitHub trending 仓库的数据获取，这将获取最新的热门仓库并准备用于聊天。
                </p>
                <Button 
                  onClick={handleTriggerImport}
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      正在获取数据...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      触发 GitHub Trend 预获取
                    </>
                  )}
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground space-y-1">
                <p>• 数据获取过程可能需要几分钟时间</p>
                <p>• 系统会自动过滤有意义的仓库（stars &gt; 5 且有描述）</p>
                <p>• 获取完成后，新的仓库将在聊天界面中可用</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={handleSaveSettings}>
            保存设置
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default SettingsPanel
