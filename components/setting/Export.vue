<template>
  <UCard class="mx-4 mt-10 flex-1">
    <template #header>
      <h3 class="text-2xl font-semibold">导出选项</h3>
      <p class="text-sm text-slate-10 font-serif">配置文章的导出选项</p>
    </template>

    <div class="flex flex-col space-y-5">
      <div>
        <p class="mb-2">
          <span class="mr-3">导出目录名:</span>
          <span class="inline-block w-8">
            <UPopover mode="hover" :popper="{ placement: 'right' }">
              <UButton color="white" size="sm" trailing-icon="i-heroicons:variable-16-solid" />

              <template #panel>
                <div class="p-4">
                  <p class="my-2 font-medium">支持的变量：</p>
                  <table class="w-full border-collapse border">
                    <tbody>
                      <tr>
                        <th class="w-20">变量</th>
                        <th class="w-32">含义</th>
                        <th class="w-20">变量</th>
                        <th class="w-32">含义</th>
                      </tr>
                      <tr v-for="(item, idx) in variables" :key="idx">
                        <td class="text-center">{{ item[0].name }}</td>
                        <td class="text-center">{{ item[0].description }}</td>
                        <td class="text-center">{{ item[1].name }}</td>
                        <td class="text-center">{{ item[1].description }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>
            </UPopover>
          </span>
        </p>
        <p class="text-sm mb-2 text-gray-500">影响 <span class="font-mono">html/txt/markdown/word/pdf</span> 的导出</p>
        <UInput
          placeholder="目录名格式"
          class="w-[600px] font-mono"
          name="dirname"
          v-model="preferences.exportConfig.dirname"
        />
      </div>
      <div>
        <p class="mb-2 flex items-center gap-3">
          <span>目录名最大长度:</span>
          <span class="text-xs text-gray-500">(0表示不限制)</span>
          <UInput
            class=""
            placeholder="目录名最大长度"
            v-model="preferences.exportConfig.maxlength"
            type="number"
            min="0"
          />
        </p>
      </div>
      <div>
        <UCheckbox
          v-model="preferences.exportConfig.exportExcelIncludeContent"
          name="exportExcelIncludeContent"
          label="导出 Excel 中包含文章内容"
        />
      </div>
      <div>
        <UCheckbox
          v-model="preferences.exportConfig.exportJsonIncludeContent"
          name="exportJsonIncludeContent"
          label="导出 JSON 中包含文章内容"
        />
        <UCheckbox
          v-model="preferences.exportConfig.exportJsonIncludeComments"
          name="exportJsonIncludeComments"
          label="导出 JSON 中包含留言数据"
        />
      </div>
      <div>
        <UCheckbox
          v-model="preferences.exportConfig.exportHtmlIncludeComments"
          name="exportHtmlIncludeComments"
          label="导出 HTML 中包含留言数据"
        />
      </div>
      <div class="mt-6 border-t pt-6">
        <h3 class="text-lg font-medium mb-4">扣子Coze知识库配置</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- 扣子API密钥 -->
          <div>
            <label class="block text-sm text-gray-600 mb-1">API密钥（API Key）</label>
            <UInput
              v-model="preferences.exportConfig.cozeApiKey"
              type="password"
              placeholder="请输入扣子开放平台API Key"
              class="w-full"
            />
          </div>
          <!-- 扣子知识库ID -->
          <div>
            <label class="block text-sm text-gray-600 mb-1">知识库ID</label>
            <UInput
              v-model="preferences.exportConfig.cozeKbId"
              placeholder="请输入目标知识库ID"
              class="w-full"
            />
          </div>
          <!-- 是否覆盖已有文档 -->
          <div class="md:col-span-2">
            <UCheckbox
              v-model="preferences.exportConfig.cozeCoverDoc"
              label="导出时覆盖扣子平台同名文档（否则跳过）"
            />
          </div>
          <!-- 文档标题前缀 -->
          <div class="md:col-span-2">
            <label class="block text-sm text-gray-600 mb-1">文档标题前缀（可选）</label>
            <UInput
              v-model="preferences.exportConfig.cozeTitlePrefix"
              placeholder="例：【公众号文章】-，为空则直接使用文章标题"
              class="w-full"
            />
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-2">
          配置说明：API密钥和知识库ID可在<a href="https://www.coze.cn/open" target="_blank" class="text-blue-500">扣子开放平台</a>获取
        </p>
      </div>
    </div>
  </UCard>
</template>

<script setup lang="ts">
import type { Preferences } from '~/types/preferences';

const preferences: Ref<Preferences> = usePreferences() as unknown as Ref<Preferences>;

const _variables = [
  { name: 'account', description: '公众号名称' },
  { name: 'title', description: '文章标题' },
  { name: 'aid', description: '文章id' },
  { name: 'author', description: '作者' },
  { name: 'YYYY', description: '年' },
  { name: 'MM', description: '月' },
  { name: 'DD', description: '日' },
  { name: 'HH', description: '时' },
  { name: 'mm', description: '分' },
];
const variables = Array.from({ length: Math.ceil(_variables.length / 2) }, (_, i) => [
  _variables[i * 2] ?? {},
  _variables[i * 2 + 1] ?? {},
]);
</script>

<style scoped>
table th {
  padding: 0.5rem 0.25rem;
}
table td {
  border: 1px solid #00002d17;
  padding: 0.25rem 0.5rem;
}

td:first-child,
th:first-child {
  border-left: none;
}

td:last-child,
th:last-child {
  border-right: none;
}

th {
  border: 1px solid #00002d17;
  border-top: none;
}

tr:nth-child(even) {
  background-color: #00005506;
}

tr:hover {
  background-color: #00005506;
}
</style>
