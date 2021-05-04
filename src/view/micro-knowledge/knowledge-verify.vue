<template>
  <div>
    <template v-if="loading">
      <Row v-if="loading">
        <i-col class="demo-spin-col" offset="8" span="8">
          <Spin fix>
            <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
            <div>Loading</div>
          </Spin>
        </i-col>
      </Row>
    </template>
    <template v-else-if="hasNext||knowledgeArray.length>0">
      <knowledge-detail v-bind="currentKnowledge"></knowledge-detail>
      <!-- <knowledge-detail v-else v-bind="post2"></knowledge-detail> -->
      <Divider />
      <Row style="margin:10px auto;text-align: center;">
        <ButtonGroup>
          <i-button :disabled='buttonDisabled' type='error' @click="verify(-1)" style="font-size: 14px">
            <Icon type="md-close" />
            {{buttonDisabled?counter+'秒':'不通过'}}

          </i-button>
          <i-button :disabled='buttonDisabled' @click="verify(0)" style="font-size: 14px">
            <Icon type="ios-fastforward" />
            {{buttonDisabled?counter+'秒':'跳过'}}
          </i-button>
          <i-button :disabled='buttonDisabled' type='success' @click="verify(1)" style="font-size: 14px">
            <Icon type="md-checkmark" />
            {{buttonDisabled?counter+'秒':'通过'}}
          </i-button>
        </ButtonGroup>
      </Row>
    </template>
    <h1 v-else style="text-align:center">目前尚无微知识需要审核，快去发表吧！</h1>

  </div>
</template>

<script>
import KnowledgeDetail from '../components/knowledge-detail/knowledge-detail.vue'
import { getKnowledgePage, verifyMicroKnowledge } from '@/api/microknowledge.js'
import { getErrModalOptions, getLocalTime } from '@/libs/util.js'
export default {
  components: {
    KnowledgeDetail
  },
  data () {
    return {
      temp: true,
      knowledgeArray: [],
      pageIndex: 1,
      pageSize: 10,
      counter: 10,
      hasNext: false,
      timer: null,
      buttonDisabled: true,
      loading: true
    }
  },
  mounted () {
    this.loadData()
    this.settimer()
  },
  computed: {
    currentKnowledge: function () {
      if (this.knowledgeArray.length > 0) {
        return this.knowledgeArray[0]
      } else if (this.hasNext) {
        this.loadData()
        return this.knowledgeArray[0]
      }
    }
  },
  methods: {
    convertArray (array) {
      console.log(array)
      return array.map(item => {
        const kind = Object.keys(item).indexOf('citation') >= 0 ? 0 : 1
        const anonymous = { username: '匿名用户', insitute: '' }
        const commonProps = {
          id: item.id,
          creator: anonymous,
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
        let evidenceIden = {}
        let conjectureIden = {}
        if (kind === 0) {
          evidenceIden = {
            publishedYear: item.published_year,
            displayType: 0,
            source: item.source,
            citation: item.citation
          }
        } else {
          conjectureIden = {
            displayType: 0,
            evidences: this.convertArray(item.evidences)
          }
        }
        return {
          ...commonProps,
          ...(kind === 0 ? evidenceIden : conjectureIden)
        }
      })
    },
    verify (value) {
      if (value === 1) {
        verifyMicroKnowledge(this.currentKnowledge.id, 'post', { passed: 1 }).then(res => {
          this.$Message.success('你选择了通过！')
        }).catch(err => {
          console.log(err)
          this.$Modal.error(getErrModalOptions(err))
        })
      } else if (value === -1) {
        verifyMicroKnowledge(this.currentKnowledge.id, 'post', { unpassed: 1 }).then(res => {
          this.$Message.success('你选择了不通过！')
        }).catch(err => {
          console.log(err)
          this.$Modal.error(getErrModalOptions(err))
        })
      } else {
        this.$Message.success('你选择了跳过！')
      }
      this.knowledgeArray.splice(0, 1)
      this.settimer()
    },
    loadData () {
      this.loading = true
      getKnowledgePage('get', {
        pindx: 1,
        num_per_page: this.pageSize,
        micro_evidence: true,
        micro_conjecture: true,
        judge_status: 0
      }).then(res => {
        this.knowledgeArray.push(...this.convertArray(res.data.page))
        this.hasNext = res.data.has_next
        this.loading = false
      }).catch(err => {
        console.log(err)
        this.$Modal.error(getErrModalOptions(err))
      })
    },
    settimer () {
      this.buttonDisabled = true
      this.timer = setInterval(() => {
        this.counter--
        this.buttonDisabled = true
        this.verifyHint = this.counter + '秒'
        if (this.counter === 0) {
          clearInterval(this.timer)
          this.buttonDisabled = false
          this.counter = 10
        }
      }, 1000)
    }
  }
}
</script>

<style>
.reject {
  background-color: red;
}
.skip {
  background-color: grey;
}
</style>
