<template>
  <Row>
    <i-col offset="1" span="8">
      <Card>
        <Form ref="form" :model="form" :rules="ruleCustom" :label-width="120" style="margin-right: 50px;">
          <Form-item label="微证据引用1" prop="citation1"><Input :disabled="true" type="text" v-model="form.citation1" placeholder="请在右侧引用微证据" /></Form-item>
          <Form-item label="微证据引用2" prop="citation2"><Input :disabled="true" type="text" placeholder="请在右侧引用微证据" v-model="form.citation2" /></Form-item>
          <Form-item label="主题" prop="topic">
            <Select v-model="form.topic" multiple style="width:200px" filterable>
              <Option v-for="item in topicList" :value="item.value" :key="item.value">{{ item.label }}</Option>
            </Select>
          </Form-item>
          <Form-item label="内容" prop="content"><Input type="textarea" placeholder="内容不超过200字" maxLength=200 :rows=12 v-model="form.content" /></Form-item>
          <Form-item label="标签" prop="tags"><Input type="text" placeholder="请输入至少三个标签(以空格分隔)" v-model="form.tags" /></Form-item>
          <Button type="primary" @click="handleSubmit('form')" long>发布</Button>
        </Form>
      </Card>
    </i-col>
    <i-col offset="4" span="10">
      <Divider> 从收藏中选取引用 </Divider>
      <Scroll v-if="evidences.length !== 0" height="550">
        <knowledge-card v-for="prop of evidences" :key="prop.id" @cite-event="handleCite" v-bind="prop" />
        <Row v-if="loading">
          <i-col class="demo-spin-col">
            <Spin fix>
              <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
              <div>Loading</div>
            </Spin>
          </i-col>
        </Row>
        <Row v-else-if="hasNext">
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
      <template v-else-if="loading">
        <Row v-if="loading">
          <i-col class="demo-spin-col">
            <Spin fix>
              <Icon type="ios-loading" size=18 class="demo-spin-icon-load"></Icon>
              <div>Loading</div>
            </Spin>
          </i-col>
        </Row>
      </template>
      <Row v-else>
        <i-col style="text-align: center">
          暂无收藏
        </i-col>
      </Row>
    </i-col>
  </Row>
</template>
<script>
import KnowledgeCard from './knowledge-card.vue'
import { favorKnowledgeList, createConjecture, getTags } from '@/api/microknowledge.js'
import { getUserInfo } from '@/api/user'
import { getErrModalOptions, getLocalTime } from '@/libs/util.js'
export default {
  components: {
    KnowledgeCard
  },
  data () {
    const validateCitation = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入参考文献'))
      } else {
        callback()
      }
    }
    const validateContent = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入猜想内容(不超过200字)'))
      } else if (value.length > 200) {
        callback(new Error('内容不得超过200字'))
      } else {
        callback()
      }
    }
    const validateTopic = (rule, value, callback) => {
      if (value.length === 0) {
        callback(new Error('请选择主题'))
      } else {
        callback()
      }
    }
    const validateTags = (rule, value, callback) => {
      if (value === '' || value.split(' ').length < 3) {
        callback(new Error('请输入至少3个标签(以空格分隔)'))
      } else {
        callback()
      }
    }

    return {
      loading: true,
      pageIndex: 1,
      hasNext: false,
      pageSize: 5,
      topicList: [],
      form: {
        topic: [],
        content: '',
        tags: '',
        citation1: '',
        citation2: '',
        citationid1: '',
        citationid2: ''
      },
      evidences: [],
      ruleCustom: {
        citation1: [
          {
            required: true,
            validator: validateCitation,
            trigger: 'blur'
          }
        ],
        citation2: [
          {
            required: true,
            validator: validateCitation,
            trigger: 'blur'
          }
        ],
        topic: [
          {
            required: true,
            validator: validateTopic,
            trigger: 'blur'
          }
        ],
        content: [
          {
            required: true,
            validator: validateContent,
            trigger: 'blur'
          }
        ],
        year: [
          {
            required: true,
            message: '请输入参考文献年份',
            trigger: 'blur'
          }
        ],
        tags: [
          {
            required: true,
            validator: validateTags,
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
      }).catch(error => {
        this.$Modal.error(getErrModalOptions(error))
      })
    }
    this.loadData()
    this.getTopicList()
  },

  methods: {
    loadData () {
      this.loading = true
      favorKnowledgeList({
        pindex: this.pageIndex,
        num_per_page: this.pageSize,
        user_id: this.$store.state.user.userId,
        micro_evidence: true,
        micro_conjecture: false
      }).then(res => {
        const data = this.changeToprops(res.data.page)
        this.evidences.push(...data)
        this.hasNext = res.data.has_next
        this.loading = false
      }).catch(err => {
        this.$Modal.error(getErrModalOptions(err))
      })
    },

    handleSubmit (name) {
      this.$refs[name].validate(valid => {
        if (valid) {
          const tags = this.form.topic.map(tag => { return { name: tag, type: 0 } }).concat(this.form.tags.split(' ').map(tag => { return { name: tag, type: 1 } }))
          createConjecture('post', {
            content: this.form.content,
            tags: tags,
            evidences: [this.form.citationid1, this.form.citationid2]
          }).then(res => { this.$Message.success('发布成功!请等待审核！') }).catch(err => { this.$Modal.error(getErrModalOptions(err)) })
        } else {
          this.$Message.error('发布失败!')
        }
      })
    },

    handleReset (name) {
      this.$refs[name].resetFields()
    },

    handleCite (event) {
      if (event.cited) {
        if (this.form.citation1 === '') {
          [this.form.citationid1, this.form.citation1] = [event.id, event.content]
        } else if (this.form.citation2 === '') {
          [this.form.citationid2, this.form.citation2] = [event.id, event.content]
        }
      } else {
        if (this.form.citationid1 === event.id) {
          [this.form.citationid1, this.form.citation1] = [this.form.citationid2, this.form.citation2]
        }
        [this.form.citationid2, this.form.citation2] = ['', '']
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
          isCollect: item.is_favor,
          likeNumber: item.like_num,
          favorNumber: item.favor_num,
          displayType: 1,
          source: item.source,
          citation: item.citation
        }
      })
    },

    loadMoreData () {
      this.pageIndex += 1
      this.loadData()
    },
    getTopicList () {
      getTags('get', {
        pindx: 1,
        num_per_page: 99,
        presupposed: true
      }).then(res => {
        this.topicList = res.data.page.map(tag => ({ value: tag.name, label: tag.name }))
      }).catch(err => {
        console.log(err)
      })
    }
  }
}
</script>

<style>
</style>
