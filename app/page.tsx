'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Brain, Heart, Map } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <div className="container mx-auto px-4 py-20">
        {/* 标题 */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
            认知考古系统
          </h1>
          <p className="text-xl text-gray-400">
            通过对话重构对人生事件的理解
          </p>
        </div>

        {/* 核心理念 */}
        <div className="max-w-3xl mx-auto mb-16">
          <Card className="bg-gray-900 border-gray-800 p-8">
            <h2 className="text-2xl font-bold mb-4">核心理念</h2>
            <div className="space-y-4 text-gray-300">
              <p>
                <strong className="text-white">哲学基础：</strong>
                未知与纠结相互循环，客观是解决方案
              </p>
              <p>
                <strong className="text-white">解决思路：</strong>
                通过细节还原释放压抑情绪，探寻观念根源，理解事物的生态系统性
              </p>
              <div className="mt-4 p-4 bg-gray-800 rounded-lg">
                <p className="font-semibold text-blue-400 mb-2">三步流程：</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>直视现实 - 还原事实细节</li>
                  <li>推理洞见 - 发现隐藏模式</li>
                  <li>形成新观念 - 重构认知框架</li>
                </ol>
              </div>
            </div>
          </Card>
        </div>

        {/* 功能特性 */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          <Card className="bg-gray-900 border-gray-800 p-6">
            <Brain className="w-12 h-12 text-blue-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">苏格拉底式对话</h3>
            <p className="text-gray-400">
              通过深度提问引导你还原事件细节，不给建议只提问
            </p>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-6">
            <Map className="w-12 h-12 text-amber-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">3D认知地图</h3>
            <p className="text-gray-400">
              实时可视化对话内容，展现事实、洞见、观念三层结构
            </p>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-6">
            <Heart className="w-12 h-12 text-red-400 mb-4" />
            <h3 className="text-xl font-bold mb-2">张力点识别</h3>
            <p className="text-gray-400">
              找到情绪高但事实模糊的区域，重点探索认知缺口
            </p>
          </Card>
        </div>

        {/* 开始按钮 */}
        <div className="text-center space-y-4">
          <Link href="/cognitive-archaeology">
            <Button size="lg" className="text-lg px-8 py-6">
              开始认知考古之旅
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          
          <p className="text-sm text-gray-500">
            或者访问
            <Link href="/emotional-support" className="text-blue-400 hover:underline ml-1">
              情感支持系统
            </Link>
          </p>
        </div>

        {/* 使用说明 */}
        <div className="max-w-2xl mx-auto mt-16 p-6 bg-gray-900 rounded-lg">
          <h3 className="text-lg font-bold mb-3">使用说明</h3>
          <ul className="space-y-2 text-sm text-gray-400">
            <li>• 选择一个困扰你的人生事件或关系</li>
            <li>• 从具体的场景或瞬间开始描述</li>
            <li>• 跟随AI的提问，逐步还原细节</li>
            <li>• 观察认知地图的形成，发现新的理解</li>
            <li>• 可以上传相关图片作为探索起点</li>
          </ul>
        </div>

        {/* 免责声明 */}
        <div className="text-center mt-12 text-xs text-gray-500">
          <p>本系统不能替代专业心理咨询，不适用于严重心理问题</p>
          <p className="mt-1">您的数据不会被保存，对话仅在会话期间有效</p>
        </div>
      </div>
    </div>
  );
}