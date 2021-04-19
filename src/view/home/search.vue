<template>
  <Row>
    <i-col
      offset="2"
      span="15"
    >
      <Card>
        <template v-if="items.length !== 0">
          <KnowledgeCard
            v-for="item in items"
            :key="item.key"
            v-bind='item'
          />
          <Row v-if="loading">
            <i-col class="demo-spin-col" offset="8" span="8">
              <Spin fix>
                <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
                <div>Loading</div>
              </Spin>
            </i-col>
          </Row>
          <Row v-else-if="hasNextPage">
            <i-col style="text-align: center">
              <a @click.prevent="loadMoreData"> 加载更多 </a>
            </i-col>
          </Row>
          <Row v-else>
            <i-col style="text-align: center">
              暂无更多微知识
            </i-col>
          </Row>
        </template>
        <template v-else>
          <Row v-if="loading">
            <i-col class="demo-spin-col" offset="8" span="8">
              <Spin fix>
                <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
                <div>Loading</div>
              </Spin>
            </i-col>
          </Row>
          <div style="text-align: center; font-size: 20px;" v-else>
            <br>
            <br>
            <br>
            暂无相关搜索结果
            <br>
            <br>
            <br>
          </div>
        </template>
      </Card>
    </i-col>
    <i-col
      offset="1"
      span="6"
    >
      <Card>
        <p slot="title" style="font-size: 18px">
          筛选器
        </p>
        <p class="type-selector">
          微知识类型：
        </p>
        <i-select
          v-model="knowledgeType"
          @on-change="selectType"
          style="width: 80%"
        >
          <Option value="all">
            全部
          </Option>
          <Option value="micro-evidence">
            微证据
          </Option>
          <Option value="micro-suppose">
            微猜想
          </Option>
        </i-select>
        <br>
        <br>
        <p class="type-selector">
          标签：
        </p>
        <i-select
          v-model="selectTagList"
          style="width: 80%"
          multiple
          @on-change="changeTag"
          filterable
        >
          <Option
            v-for="item in tagList"
            :value="item.value"
            :key="item.value"
          >
            {{ item.label }}
          </Option>
        </i-select>
      </Card>
    </i-col>
  </Row>
</template>

<script>
import KnowledgeCard from '@/view/micro-knowledge/knowledge-card'
import { getKnowledgePage, getTags } from '@/api/microknowledge'
import { getErrModalOptions, getLocalTime } from '@/libs/util.js'
export default {
  name: 'Search',

  components: { KnowledgeCard },

  data () {
    return {
      activeTab: 'recommend',
      knowledgeType: 'all',
      selectTagList: [],
      tagSearch: '',
      tagList: [],
      pageIndex: 1,
      hasNextPage: true,
      items: [],
      pageSize: 15,
      query: this.$route.params.query,
      searchEvidence: true,
      searchConjecture: true,
      loading: true
    }
  },

  watch: {
    '$route' (to, from) {
      this.query = this.$route.params.query
      this.pageIndex = 1
      this.items = []
      this.loadData()
    }
  },

  mounted () {
    getTags('get', {
      pindx: 1,
      num_per_page: 99,
      presupposed: true
    }).then(res => {
      this.tagList = res.data.page.map(tag => ({ value: tag.name, label: tag.name }))
    }).catch(err => {
      console.log(err)
    })
    this.loadData()
  },

  methods: {
    loadData: function () {
      this.loading = true
      getKnowledgePage('get', {
        pindx: this.pageIndex,
        num_per_page: this.pageSize,
        tags: this.tagSearch === '' ? null : this.tagSearch,
        keywords: this.$route.params.query,
        micro_evidence: this.searchEvidence,
        micro_conjecture: this.searchConjecture
      }).then(res => {
        const mapData = res.data.page.map(item => {
          return {
            id: item.id,
            creator: item.created_by,
            kind: item.type - 1,
            createAt: getLocalTime(item.created_at),
            publishedYear: item.published_year,
            content: item.content,
            tags: item.tags,
            isLike: item.is_like,
            isCollect: item.is_favor,
            likeNumber: item.like_num,
            favorNumber: item.favor_num,
            displayType: 0,
            source: item.source,
            citation: item.citation,
            evidences: item.evidences,
            key: `${item.type}-${item.id}`
          }
        })
        this.items.push(...mapData)
        this.loading = false
        this.hasNextPage = res.data.has_next
      }).catch(error => {
        this.$Modal.error(getErrModalOptions(error))
      })
    },

    selectType: function (value) {
      this.knowledgeType = value
      if (value === 'all') {
        this.searchEvidence = true
        this.searchConjecture = true
      } else if (value === 'micro-evidence') {
        this.searchEvidence = true
        this.searchConjecture = false
      } else {
        this.searchEvidence = false
        this.searchConjecture = true
      }
      // reset
      this.pageIndex = 1
      this.items = []
      this.loadData()
    },

    changeTag: function (tags) {
      this.selectTagList = tags
      this.tagSearch = ''
      tags.forEach(item => {
        this.tagSearch += item + ' '
      })
      this.tagSearch = this.tagSearch.trim()
      this.pageIndex = 1
      this.items = []
      this.loadData()
    },

    loadMoreData: function () {
      this.pageIndex += 1
      this.loadData()
    }
  }
}
</script>

<style lang="less">
.ivu-tabs-tab{
  font-size: 20px;
  font-family: -apple-system,BlinkMacSystemFont,Helvetica Neue,PingFang SC,Microsoft YaHei,Source Han Sans SC,Noto Sans CJK SC,WenQuanYi Micro Hei,sans-serif;
}
.type-selector{
  font-size: 16px;
  font-weight: bold;
  padding-bottom: 5px;
}
</style>
