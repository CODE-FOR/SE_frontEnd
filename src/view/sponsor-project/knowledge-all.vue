<template>
  <Scroll :on-reach-bottom="handleReachBottom" :height='500'>
    <template>

      <Card v-for="item in knowledgeArray" :key="item.id">
        <div slot="title">
          添加者：<a href='#'>123456</a>
          <!-- <User v-bind='adder'>
            <p slot='userType'>添加者：</p>
          </User> -->
        </div>
        <KnowledgeCard v-bind='item' />
      </Card>
      <Row v-if="!hasNext">
        <i-col style="text-align: center">
          暂无更多微知识
        </i-col>
      </Row>
    </template>
  </Scroll>
</template>

<script>
import { getKnowledgePage } from '@/api/microknowledge'
import KnowledgeCard from '@/view/micro-knowledge/knowledge-card'
import { getUserInfo } from '@/api/user'
import User from '@/view/components/uesr/user'
import { getLocalTime } from '@/libs/util.js'
export default {
  components: {
    KnowledgeCard,
    User
  },
  data () {
    return {
      hasNext: true,
      pageIndex: 1,
      pageSize: 5,
      knowledgeArray: [],
      adder: {}
    }
  },
  mounted: function () {
    this.loadData()
    getUserInfo().then(res => {
      this.adder = { id: res.data.id, username: res.data.username }
    }).catch(err => {
      console.log(err)
    })
  },
  methods: {
    handleReachBottom: function () {
      return new Promise(resolve => {
        this.loadData()
      })
    },
    convertArray: function (array) {
      return array.map(item => {
        const kind = Object.keys(item).indexOf('citation') >= 0 ? 0 : 1
        const commonProps = {
          id: item.id,
          creator: item.created_by,
          kind: kind,
          createAt: getLocalTime(item.created_at),
          content: item.content,
          tags: item.tags,
          isLike: item.is_like,
          isCollect: item.is_collect,
          likeNumber: item.like_num,
          favorNumber: item.collect_num,
          displayType: 0
        }
        // console.log(commonProps)
        const evidenceIden = {
          publishedYear: item.published_year,
          displayType: 0,
          source: item.source,
          citation: item.citation
        }
        const conjectureIden = {
          displayType: 0,
          evidences: item.evidences
        }
        return {
          ...commonProps,
          ...(kind === 0 ? evidenceIden : conjectureIden)
        }
      })
    },
    loadData () {
      getKnowledgePage('get', {
        pindx: this.pageIndex,
        num_per_page: this.pageSize,
        micro_evidence: true,
        micro_conjecture: true
        // judge_status: 1
      }).then(res => {
        this.knowledgeArray.push(...this.convertArray(res.data.page))
        this.pageIndex += 1
        this.hasNext = res.data.has_next
      }).catch(err => {
        console.log(err)
      })
    }
  }
}
</script>
