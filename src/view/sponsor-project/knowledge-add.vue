<template>
  <Row>
    <i-col span="10">
      <Card>
        <p slot='title' style="text-align:center">添加微知识</p>
        <Form ref="form" :model="form" :rules="ruleCustom" :label-width="120" style="margin-right: 50px;">
          <Form-item label="微知识" prop="citation"><Input :disabled="true" type="text" v-model="form.citation1" placeholder="请在右侧选择微知识" /></Form-item>
          <Form-item label="添加原因" prop="reason"><Input type="textarea" placeholder="原因不超过200字" maxLength=200 :rows=12 v-model="form.reason" /></Form-item>
          <Button type="primary" @click="handleSubmit('form')" long>添加</Button>
        </Form>
      </Card>
    </i-col>
    <i-col offset="4" span="10">
      <Divider> 从收藏中选取微知识 </Divider>
      <Scroll v-if="evidences.length !== 0" height="440">
        <knowledge-card v-for="prop of evidences" :key="prop.id" @cite-event="handleCite" v-bind="prop" citeMessageInit="添加" />
        <Row v-if="hasNext">
          <i-col style="text-align: center">
            <a @click.prevent="loadMoreData"> 加载更多 </a>
          </i-col>
        </Row>
        <Row v-else>
          <i-col style="text-align: center">
            暂无更多收藏
          </i-col>
        </Row>
      </Scroll>
      <Row v-else>
        <i-col style="text-align: center">
          暂无收藏
        </i-col>
      </Row>
    </i-col>
  </Row>
</template>
<script>
import KnowledgeCard from '@/view/micro-knowledge//knowledge-card.vue'
import { favorKnowledgeList } from '@/api/microknowledge.js'
import { getUserInfo } from '@/api/user'
import { getErrModalOptions, getLocalTime } from '@/libs/util.js'
export default {
  name: 'KnowledgeAdd',
  components: {
    KnowledgeCard
  },
  data () {
    const validateContent = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入添加原因'))
      } else if (value.length > 200) {
        callback(new Error('原因不得超过200字'))
      } else {
        callback()
      }
    }

    return {
      pageIndex: 1,
      hasNext: false,
      pageSize: 5,
      topicList: [
        // { value: '大数据', label: '大数据' },
        // { value: '人工智能', label: '人工智能' },
        // { value: '机器学习', label: '机器学习' },
        // { value: '体系结构', label: '体系结构' },
        // { value: '生物医学', label: '生物医学' },
        // { value: '微观经济', label: '微观经济' }
      ],
      form: {
        reason: '',
        citation: '',
        citationid: ''
      },
      evidences: [],
      ruleCustom: {
        citation: [
          {
            required: true,
            message: '请选择要添加的微知识',
            trigger: 'blur'
          }
        ],
        reason: [
          {
            required: true,
            validator: validateContent,
            trigger: 'blur'
          }
        ]
      }
    }
  },

  async mounted () {
    if (!this.$store.state.user.id) {
      await getUserInfo().then(res => {
        this.$store.commit('setUserProfile', res.data)
        // console.log(res.data)
        // console.log(this.$store.state.user)
      }).catch(error => {
        this.$Modal.error(getErrModalOptions(error))
      })
    }
    this.loadData()
  },

  methods: {
    loadData () {
      // console.log(this.$store.state.user.userId)
      favorKnowledgeList({
        pindex: this.pageIndex,
        num_per_page: this.pageSize,
        user_id: this.$store.state.user.userId,
        micro_evidence: true,
        micro_conjecture: true
      }).then(res => {
        const data = this.changeToprops(res.data.page)
        this.evidences.push(...data)
        this.hasNext = res.data.has_next
      }).catch(err => {
        this.$Modal.error(getErrModalOptions(err))
      })
    },

    handleSubmit (name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          createConjecture('post', {
            content: this.form.content
          }).then(res => { this.$Message.success('添加成功!请等待审核！') }).catch(err => { this.$Modal.error(getErrModalOptions(err)) })
        } else {
          this.$Message.error('添加失败!')
        }
      })
    },

    handleReset (name) {
      this.$refs[name].resetFields()
    },

    handleCite (event) {
      if (event.cited) {
        if (this.form.citation === '') {
          [this.form.citationid, this.form.citation] = [event.id, event.content]
        }
      } else {
        if (this.form.citationid === event.id) {
          [this.form.citationid, this.form.citation] = ['', '']
        }
      }
    },

    changeToprops (array) {
      return array.map(item => {
        return {
          id: item.id,
          creator: item.created_by,
          kind: 0,
          createAt: getLocalTime(item.created_at),
          publishedYear: item.published_year,
          content: item.content,
          tags: item.tags,
          isLike: item.is_like,
          isCollect: item.is_collect,
          likeNumber: item.like_num,
          favorNumber: item.collect_num,
          displayType: 1,
          source: item.source,
          citation: item.citation
        }
      })
    },

    loadMoreData () {
      this.pageIndex += 1
      this.loadData()
    }
  }
}
</script>

<style>
</style>
