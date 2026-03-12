<template>
  <AppPage show-footer>
    <div class="flex">
      <n-card class="w-full" title="智能行李寄存柜管理平台">
        <p class="opacity-60">
          智能行李寄存柜管理平台是一个面向寄存柜厂商与平台管理员的统一管理系统，支持厂商入驻审核、设备同步与管理、柜群管理、权限管控等核心功能，为行李寄存柜业务提供一站式管理方案。
        </p>
      </n-card>
    </div>

    <div class="mt-12 flex">
      <n-card class="w-50%" title="平台功能" segmented>
        <ul class="opacity-90">
          <li class="py-4">
            <span class="text-highlight">厂商入驻审核</span>
            ：支持厂商资质提交、多轮审核流程，确保接入厂商的合规性
          </li>
          <li class="py-4">
            <span class="text-highlight">设备同步管理</span>
            ：对接厂商系统接口，自动同步寄存柜设备信息至平台
          </li>
          <li class="py-4">
            <span class="text-highlight">寄存柜种类管理</span>
            ：灵活配置寄存柜种类及收费规则，支持多种计费时间单位
          </li>
          <li class="py-4">
            <span class="text-highlight">柜群管理</span>
            ：按地理位置组织寄存柜，管理柜群状态，查看柜群详情
          </li>
          <li class="py-4">
            <span class="text-highlight">权限管控</span>
            ：基于角色的权限管理，区分平台管理员与厂商用户，支持多厂商切换
          </li>
          <li class="py-4">
            <span class="text-highlight">厂商多角色</span>
            ：厂商主管理员与普通用户权限隔离，主管理员可管理厂商下的用户
          </li>
        </ul>
      </n-card>

      <n-card class="ml-12 w-50%" title="技术栈" segmented>
        <VChart :option="techOption" autoresize />
      </n-card>
    </div>
  </AppPage>
</template>

<script setup>
import { PieChart } from 'echarts/charts'
import { LegendComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

echarts.use([
  TooltipComponent,
  LegendComponent,
  PieChart,
  CanvasRenderer,
])

const techOption = {
  tooltip: {
    trigger: 'item',
    formatter({ name, value }) {
      return `${name} ${value}%`
    },
  },
  legend: {
    left: 'center',
  },
  series: [
    {
      bottom: '12%',
      type: 'pie',
      radius: ['35%', '90%'],
      avoidLabelOverlap: true,
      itemStyle: {
        borderRadius: 10,
        borderColor: '#fff',
        borderWidth: 2,
      },
      label: {
        show: false,
        position: 'center',
      },
      emphasis: {
        label: {
          show: true,
          fontSize: 36,
          fontWeight: 'bold',
        },
      },
      labelLine: {
        show: false,
      },
      data: [
        { value: 30, name: 'Vue 3' },
        { value: 30, name: 'Spring Boot' },
        { value: 12, name: 'MyBatis Plus' },
        { value: 10, name: 'MySQL' },
        { value: 8, name: 'Redis' },
        { value: 5, name: 'MinIO' },
        { value: 5, name: 'Naive UI' },
      ],
    },
  ],
}
</script>
