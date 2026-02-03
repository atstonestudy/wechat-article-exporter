/**
 * 扣子Coze知识库API工具 - 完全对齐实际可运行CURL请求参数
 * 官方实际调用接口：https://api.coze.cn/open_api/knowledge/document/create
 * 鉴权方式：Authorization: Bearer {apiKey}（带Bearer前缀）
 * 核心参数：dataset_id 替代 knowledge_base_id，基于base64内容上传
 */
// 事件类型与发射函数定义（保留解耦逻辑）
type CozeEvent = 'warning' | 'error' | 'info' | 'success';
type EmitFn = (event: CozeEvent, title: string, description: string) => void;

// 扣子开放平台实际接口域名（与CURL一致）
const COZE_BASE_URL = 'https://api.coze.cn/open_api/knowledge';

/**
 * 扣子API请求头封装 - 完全对齐CURL（带Bearer+Agw-Js-Conv头）
 * @param apiKey 扣子开放平台API密钥
 * @returns 与CURL一致的请求头对象
 */
function getCozeHeaders(apiKey: string) {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`, // 恢复Bearer前缀，与CURL完全一致
    'Agw-Js-Conv': 'str', // 新增CURL中必传的请求头
  };
}

/**
 * 校验扣子配置是否完整（适配dataset_id参数）
 * @param config 导出配置中的扣子配置（cozeApiKey/cozeDatasetId）
 * @param emit 事件发射函数，用于传递提示信息
 * @returns 配置完整返回true，否则false
 */
export function checkCozeConfig(config: any) {
  if (!config?.cozeApiKey || config.cozeApiKey.trim() === '') {
    // emit('warning', '扣子配置错误', '请先在导出设置中填写有效API密钥');
    return false;
  }
  if (!config?.cozeKbId || config.cozeKbId.trim() === '') {
    // emit('warning', '扣子配置错误', '请先在导出设置中填写有效数据集ID（dataset_id）');
    return false;
  }
  return true;
}

/**
 * 字符串转Base64（适配CURL中file_base64参数要求）
 * @param str 原始字符串（Markdown/纯文本）
 * @returns Base64编码后的字符串
 */
function strToBase64(str: string): string {
  try {
    // 浏览器环境直接使用btoa，处理中文需先转UTF-8
    return btoa(unescape(encodeURIComponent(str || '')));
  } catch (error) {
    console.error('Base64编码失败：', error);
    return '';
  }
}

/**
 * 上传文档到扣子知识库 - 100%对齐CURL请求参数（核心方法）
 * @param apiKey 扣子API密钥
 * @param datasetId 数据集ID（CURL中的dataset_id，替代原knowledge_base_id）
 * @param docTitle 文档名称（CURL中的name，如test.md）
 * @param docContent 文档原始内容（Markdown/纯文本，自动转Base64）
 * @param emit 事件发射函数
 * @returns 上传成功返回true，失败返回false
 */
export async function uploadToCozeKb(
  apiKey: string,
  datasetId: string,
  docTitle: string,
  docContent: string,
//   emit: EmitFn
): Promise<boolean> {
  try {
    // 1. 前置校验：空内容/空标题直接跳过
    if (!docTitle || docTitle.trim() === '') {
    //   emit('info', '跳过导出', '文档标题为空，无需上传');
      return false;
    }
    if (!docContent || docContent.trim() === '') {
    //   emit('info', '跳过导出', `【${docTitle}】内容为空，无需上传`);
      return false;
    }

    // 2. 处理文档名称和内容：标题拼接.md后缀，内容转Base64（与CURL一致）
    const finalDocName = docTitle.endsWith('.md') ? docTitle : `${docTitle}.md`;
    const fileBase64 = strToBase64(docContent);
    if (!fileBase64) {
    //   emit('error', '上传失败', `【${docTitle}】内容Base64编码失败`);
      return false;
    }

    // 3. 构造请求体 - 完全复刻CURL中的JSON参数，字段/值1:1匹配
    const requestBody = {
      dataset_id: datasetId, // 与CURL一致，替代原knowledge_base_id
      chunk_strategy: { // 分块策略，与CURL完全一致
        chunk_type: 0,
        remove_extra_spaces: true,
        caption_type: 0
      },
      format_type: 0, // 格式类型，与CURL一致
      document_bases: [ // 文档数组，与CURL结构完全一致
        {
          name: finalDocName, // 文档名称，带.md后缀
          source_info: {
            file_type: 'md', // 按Markdown格式上传，与CURL的txt对应
            document_source: 0, // 文档来源，与CURL一致
            file_base64: fileBase64 // 内容转Base64，与CURL一致
          }
        }
      ]
    };

    // 4. 发送请求 - 完全对齐CURL的POST方式和接口地址
    const res = await fetch(`${COZE_BASE_URL}/document/create`, {
      method: 'POST',
      headers: getCozeHeaders(apiKey),
      body: JSON.stringify(requestBody),
    //   timeout: 20000, // 加长超时，适配Base64大内容上传
    });

    // 5. 解析响应（兼容官方返回格式）
    const data = await res.json();
    // 成功判断：状态码200+code为0/成功提示（兼容多场景）
    if (res.ok && (data.code === 0 || data.success || data.msg === 'success')) {
    //   emit('success', '上传成功', `【${finalDocName}】已同步到扣子知识库`);
      return true;
    } else {
      throw new Error(data.msg || data.error || `接口返回失败：${res.status}`);
    }
  } catch (error: any) {
    // emit('error', '扣子上传失败', `【${docTitle}】：${error.message || '网络/接口异常'}`);
    return false;
  }
}

/**
 * （可选）删除扣子知识库中的文档（适配新参数体系）
 * @param apiKey 扣子API密钥
 * @param datasetId 数据集ID
 * @param docId 文档ID
 * @param emit 事件发射函数
 * @returns 删除成功返回true，失败返回false
 */
export async function deleteCozeDoc(
  apiKey: string,
  datasetId: string,
  docId: string,
  emit: EmitFn
): Promise<boolean> {
  try {
    const res = await fetch(`${COZE_BASE_URL}/document/${docId}`, {
      method: 'DELETE',
      headers: getCozeHeaders(apiKey),
      body: JSON.stringify({ dataset_id: datasetId }),
    //   timeout: 10000,
    });
    const data = await res.json();
    if (res.ok && (data.code === 0 || data.success)) {
      emit('info', '文档删除成功', `已删除扣子知识库中的文档（ID：${docId.slice(-8)}）`);
      return true;
    } else {
      throw new Error(data.msg || `删除失败：${res.status}`);
    }
  } catch (error: any) {
    emit('error', '文档删除失败', `：${error.message}`);
    return false;
  }
}