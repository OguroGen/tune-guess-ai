'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';

const HitSongQuizApp = () => {
  const [year, setYear] = useState('1980');
  const [quizData, setQuizData] = useState<any>(null);
  const [currentHintIndex, setCurrentHintIndex] = useState(-1);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchQuizData = async () => {
    if (!year || Number(year) < 1950 || Number(year) > 2024) {
      setError('1950年から2024年の間で年代を入力してください');
      return;
    }

    setLoading(true);
    setError('');
    setQuizData(null);
    setCurrentHintIndex(-1);
    setShowAnswer(false);

    try {
      const response = await fetch('/api/quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ year: year }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `API error: ${response.status}`);
      }

      const data = await response.json();
      console.log('受信したデータ:', data);
      
      setQuizData({
        problem: data.problem,
        hints: Array.isArray(data.hints) ? data.hints : [data.hints],
        answer: data.answer
      });
    } catch (err: any) {
      console.error('API error:', err);
      setError(`エラー: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const showNextHint = () => {
    if (quizData && currentHintIndex < quizData.hints.length - 1) {
      setCurrentHintIndex(currentHintIndex + 1);
    }
  };

  const resetQuiz = () => {
    setYear('1980');
    setQuizData(null);
    setCurrentHintIndex(-1);
    setShowAnswer(false);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4" suppressHydrationWarning>
      <div className="max-w-6xl mx-auto">
        {!quizData && (
          <>
            {/* ヘッダー */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎵</span>
                </div>
                <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  ヒット曲クイズ
                </h1>
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎵</span>
                </div>
              </div>
              <p className="text-gray-600 text-lg">年代を入力して、その時代のヒット曲を当ててみよう！</p>
            </div>

            <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-8 mx-auto max-w-md">
              <div className="text-center">
                <div className="mb-8">
                  <label className="block text-xl font-semibold text-gray-700 mb-4">
                    年代を入力 (1950-2024)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={year}
                      onChange={(e) => setYear(e.target.value)}
                      className="w-full px-6 py-4 text-2xl text-center bg-white border-2 border-gray-200 rounded-2xl focus:border-purple-400 focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all duration-200 shadow-inner"
                      placeholder="1980"
                      min="1950"
                      max="2024"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                      <span className="text-gray-400">年</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={fetchQuizData}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-400 disabled:to-gray-400 text-white font-bold py-4 px-8 rounded-2xl text-xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 shadow-lg hover:shadow-xl disabled:shadow-md"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      作成中...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <span>🎮</span>
                      クイズ開始！
                    </div>
                  )}
                </button>
                
                {error && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <span>⚠️</span>
                      {error}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {quizData && (
          <div className="grid lg:grid-cols-2 gap-8 h-screen">
            {/* 左列: 画像専用 */}
            <div className="relative h-full">
              {quizData.problem && (
                <div className="h-full">
                  <img
                    src={quizData.problem}
                    alt="ヒット曲クイズの画像"
                    className="w-full h-full object-cover rounded-3xl shadow-2xl"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="absolute top-4 right-4 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-white text-xl">❓</span>
                  </div>
                </div>
              )}
            </div>

            {/* 右列: タイトル、ヒント、コントロール */}
            <div className="flex flex-col h-full overflow-y-auto">
              {/* タイトルエリア */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-xl">🎵</span>
                  </div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    ヒット曲クイズ
                  </h1>
                </div>
                <div className="flex items-center gap-2">
                  <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    <span>🏆</span>
                    {year}年のヒット曲
                  </div>
                </div>
                <p className="mt-4 text-gray-600 font-medium text-lg">この絵から連想される曲は？</p>
              </div>

              {/* コンテンツエリア */}
              <div className="flex-1 space-y-6">
                {/* ヒント表示 */}
                {currentHintIndex >= 0 && (
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl shadow-xl border border-yellow-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">💡</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">ヒント</h3>
                    </div>
                    <div className="space-y-3">
                      {quizData.hints.slice(0, currentHintIndex + 1).map((hint: string, index: number) => (
                        <div key={index} className="flex items-start gap-3 animate-fadeIn">
                          <div className="w-7 h-7 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                            {index + 1}
                          </div>
                          <p className="text-gray-700 leading-relaxed flex-1">{hint}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 答え表示 */}
                {showAnswer && (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-xl border border-green-200 p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm">🎉</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-800">正解は...</h3>
                    </div>
                    <div className="bg-white/50 rounded-2xl p-4 border border-green-100">
                      <p className="text-2xl font-bold text-green-700 text-center leading-relaxed whitespace-pre-line">
                        {quizData.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* コントロールエリア */}
              <div className="mt-6">
                <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-xl border border-white/20 p-6">
                  <div className="flex flex-col gap-4">
                    {currentHintIndex < quizData.hints.length - 1 && !showAnswer && (
                      <button
                        onClick={showNextHint}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span>💡</span>
                          ヒントを見る ({currentHintIndex + 2}/{quizData.hints.length})
                        </div>
                      </button>
                    )}
                    
                    {!showAnswer && (
                      <button
                        onClick={() => setShowAnswer(true)}
                        className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <span>🎉</span>
                          答えを発表！
                        </div>
                      </button>
                    )}
                    
                    <button
                      onClick={resetQuiz}
                      className="w-full bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 text-white font-bold py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span>🔄</span>
                        新しいクイズ
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// SSRを無効にして、クライアントサイドでのみレンダリング
export default dynamic(() => Promise.resolve(HitSongQuizApp), {
  ssr: false,
});