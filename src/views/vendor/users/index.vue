<template>
  <CommonPage>
    <template #action>
      <NButton type="primary" @click="handleAdd">
        <i class="i-material-symbols:add mr-4 text-18" />
        添加用户
      </NButton>
    </template>

    <n-spin :show="loading">
      <n-data-table
        :columns="columns"
        :data="userList"
        :row-key="row => row.vendorUserRelationId"
      />
    </n-spin>

    <MeModal ref="addModalRef" title="添加厂商用户" width="420px" @ok="handleAddSave">
      <n-form ref="addFormRef" :model="addForm" label-placement="left" :label-width="100">
        <n-form-item
          label="用户名"
          path="username"
          :rule="{ required: true, message: '请输入用户名', trigger: ['input', 'blur'] }"
        >
          <n-input v-model:value="addForm.username" placeholder="请输入要添加的用户名" class="w-full" />
        </n-form-item>
      </n-form>
    </MeModal>
  </CommonPage>
</template>

<script setup>
import { NButton, NTag } from 'naive-ui'
import { MeModal } from '@/components'
import { useForm, useModal } from '@/composables'
import api from './api'

defineOptions({ name: 'VendorUsers' })

const loading = ref(false)
const userList = ref([])

const [addModalRef] = useModal()
const [addFormRef, addForm, addValidation] = useForm({
  username: '',
})

const columns = [
  { title: '用户名', key: 'username', width: 150 },
  { title: '真实姓名', key: 'realName', width: 120 },
  { title: '手机号', key: 'phone', width: 140 },
  {
    title: '角色',
    key: 'isMain',
    width: 100,
    render: row =>
      h(NTag, { type: row.isMain ? 'success' : 'default', size: 'small' }, {
        default: () => row.isMain ? '主管理员' : '普通管理员',
      }),
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    align: 'right',
    render(row) {
      if (row.isMain)
        return null
      return h(
        NButton,
        {
          size: 'small',
          type: 'error',
          onClick: () => handleRemove(row),
        },
        {
          default: () => '移除',
          icon: () => h('i', { class: 'i-material-symbols:delete-outline text-14' }),
        },
      )
    },
  },
]

onMounted(async () => {
  await loadUsers()
})

async function loadUsers() {
  loading.value = true
  try {
    const { data } = await api.getVendorUsers()
    userList.value = data || []
  }
  catch (error) {
    console.error(error)
  }
  finally {
    loading.value = false
  }
}

function handleAdd() {
  addForm.value.username = ''
  addModalRef.value?.open()
}

async function handleAddSave() {
  await addValidation()
  await api.addVendorUser(addForm.value.username)
  $message.success('添加成功')
  await loadUsers()
}

function handleRemove(row) {
  $dialog.warning({
    title: '提示',
    content: `确定移除用户 ${row.username || row.vendorUserId} ？`,
    positiveText: '确定',
    negativeText: '取消',
    async onPositiveClick() {
      await api.removeVendorUser(row.vendorUserRelationId)
      $message.success('移除成功')
      await loadUsers()
    },
  })
}
</script>
