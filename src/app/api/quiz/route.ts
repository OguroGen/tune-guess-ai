import { NextRequest, NextResponse } from 'next/server';

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function POST(request: NextRequest) {
  try {
    const body: any = await request.json();
    const { year } = body;

    if (!year) {
      return NextResponse.json(
        { error: '年代が指定されていません' },
        { status: 400 }
      );
    }

    console.log('Dify APIを呼び出し中...', year);

    const response = await fetch('https://api.dify.ai/v1/workflows/run', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer app-WFQOJzaUMjsyEOanpeo2fmi6',
      },
      body: JSON.stringify({
        inputs: { 
          query: `${year}年のヒット曲クイズを作成してください` 
        },
        response_mode: 'blocking',
        user: 'user-' + Date.now()
      }),
    });

    console.log('Difyレスポンスステータス:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Dify API error:', errorText);
      return NextResponse.json(
        { error: `Dify API error: ${response.status} - ${errorText}` },
        { status: response.status }
      );
    }

    const data: any = await response.json();
    console.log('=== Dify生レスポンス全体 ===');
    console.log(JSON.stringify(data, null, 2));
    console.log('=== データ構造解析 ===');

    // Difyからの応答形式を確認し、適切にパース
    let result: any;
    
    if (data.data && data.data.outputs) {
      result = data.data.outputs;
    } else if (data.outputs) {
      result = data.outputs;
    } else if (data.data) {
      result = data.data;
    } else {
      result = data;
    }

    console.log('result オブジェクト:', result);
    console.log('result のキー:', Object.keys(result));

    // ヒントの処理
    let hints: string[] = [];
    const rawHints = result.hints || result.hint || [];
    if (typeof rawHints === 'string') {
      // 文字列の場合、適切に分割
      hints = rawHints
        .split(/\n/)
        .map((hint: string) => hint.replace(/^[①②③]\s*/, '').trim())
        .filter((hint: string) => hint.length > 0);
    } else if (Array.isArray(rawHints)) {
      hints = rawHints;
    }

    const responseData = {
      problem: result.problem || result.image || result.image_url || result.picture || '',
      hints: hints,
      answer: result.answer || result.song || result.title || ''
    };

    console.log('送信するデータ:', responseData);
    return NextResponse.json(responseData);

  } catch (error: unknown) {
    console.error('API呼び出しエラー:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: `サーバーエラー: ${errorMessage}` },
      { status: 500 }
    );
  }
}