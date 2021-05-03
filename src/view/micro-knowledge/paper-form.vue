<template>
  <Form ref="form" :model="form" :rules="ruleCustom" :label-width="120">
    <!-- <Form-item label="参考文献" prop="citation"><Input type="text" v-model="form.citation" placeholder='请输入参考文献(GB7714格式)' /></Form-item> -->
    <Form-item label="标题" prop="title"><Input type="text" v-model="form.title" placeholder="请输入论文标题" /></Form-item>
    <!-- <Form-item label="参考文献链接(可选)" prop="citationUrl"><Input type="url" placeholder='请输入参考文献链接(可选)' v-model="form.citationUrl" /></Form-item> -->
    <Form-item label="作者" prop="author"><Input type="text" placeholder='请输入作者(以逗号分隔)' v-model="form.author" /></Form-item>
    <Form-item label="论文年份" prop="year">
      <Input-number v-model="form.year" />
    </Form-item>
    <Form-item label="主题" prop="topic">
      <Select v-model="form.topic" multiple style="width:260px" filterable>
        <Option v-for="item in topicList" :value="item.value" :key="item.value">{{ item.label }}</Option>
      </Select>
    </Form-item>
    <!-- <Form-item label="内容" prop="summary"><Input type="textarea" placeholder='内容不超过200字' :maxlength="200" :rows="6" v-model="form.summary" /></Form-item> -->
    <Form-item label="论文摘要" prop="summary">
      <TEditor id="tinymce" v-model="form.summary" :init="editorInit"/>
    </Form-item>
    <Form-item label="论文链接" prop="paperLink">
      <Input type="url" placeholder="请输入论文链接" v-model="form.paperLink"/>
    </Form-item>
    <Form-item label="标签" prop="tags"><Input type="text" placeholder='请输入至少三个标签(以空格分隔)' v-model="form.tags" /></Form-item>
    <Button type="primary" @click="handleSubmit('form')" long>发布</Button>
  </Form>
</template>
<script>
// import tinymce from 'tinymce/tinymce'
import { createPaper, getTags } from '@/api/microknowledge.js'
import { getErrModalOptions } from '@/libs/util.js'
import TEditor from '@/components/TEditor.vue'
export default {
  components: { TEditor },
  data () {
    // const validateCitation = (rule, value, callback) => {
    //   if (value === '') {
    //     callback(new Error('请输入参考文献'))
    //   } else {
    //     callback()
    //   }
    // }

    const validateTitle = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入标题'))
      } else {
        callback()
      }
    }

    const validateSummary = (rule, value, callback) => {
      value = tinymce.activeEditor.getContent()
      if (value === '') {
        callback(new Error('请输入微证据内容(不超过5000字)'))
      } else if (value.length > 5000) {
        callback(new Error('内容不得超过5000字'))
      } else {
        callback()
      }
    }

    // const validateUrl = (rule, value, callback) => {
    //   if (value === '') {
    //     callback()
    //   } else if (!value.match(/^((ht|f)tps?):\/\/[\w-]+(\.[\w-]+)+([\w\-.,@?^=%&:/~+#]*[\w\-@?^=%&/~+#])?$/)) {
    //     callback(new Error('文献链接不正确'))
    //   } else {
    //     callback()
    //   }
    // }

    const validateLink = (rule, value, callback) => {
      if (value === '') {
        callback()
      } else if (!value.match(/^((ht|f)tps?):\/\/[\w-]+(\.[\w-]+)+([\w\-.,@?^=%&:/~+#]*[\w\-@?^=%&/~+#])?$/)) {
        callback(new Error('论文链接不正确'))
      } else {
        callback()
      }
    }

    // const validateAuthor = (rule, value, callback) => {
    //   if (value === '' {
    //     callback(new Error('请输入论文的作者'))
    //   }) else if
    // }

    const validateTags = (rule, value, callback) => {
      if (value === '' || value.split(' ').length < 3) {
        callback(new Error('请输入至少3个标签(以空格分隔)'))
      } else {
        callback()
      }
    }

    const validateNotNull = (rule, value, callback) => {
      if (!value) {
        callback(new Error('请输入！'))
      } else {
        callback()
      }
    }

    const validateArrayNotEmpty = (rule, value, callback) => {
      if (value.length === 0) {
        callback(new Error('请选择主题'))
      } else {
        callback()
      }
    }

    const validateAuthorArrayNotEmpty = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请输入作者'))
      } else {
        callback()
      }
    }

    return {
      topicList: [
        // { value: '大数据', label: '大数据' },
        // { value: '人工智能', label: '人工智能' },
        // { value: '机器学习', label: '机器学习' },
        // { value: '体系结构', label: '体系结构' },
        // { value: '生物医学', label: '生物医学' },
        // { value: '微观经济', label: '微观经济' },
        // { value: '天文学', label: '天文学' },
        // { value: '物理', label: '物理' },
        // { value: '自然科学', label: '自然科学' },
        // { value: '其他', label: '其他' }
      ],
      form: {
        topic: [],
        summary: '',
        tags: '',
        year: null,
        paperLink: '',
        title: '',
        author: []
        // citationUrl: '',
        // citation: ''
      },
      ruleCustom: {
        // citation: [
        //   {
        //     required: true,
        //     validator: validateCitation,
        //     trigger: 'blur'
        //   }
        // ],
        // citationUrl: [{
        //   validator: validateUrl,
        //   trigger: 'blur'
        // }],
        title: [{
          required: true,
          validator: validateTitle,
          trigger: 'blur'
        }],
        topic: [
          {
            required: true,
            validator: validateArrayNotEmpty,
            trigger: 'blur'
          }
        ],
        summary: [
          {
            required: true,
            validator: validateSummary,
            trigger: 'blur'
          }
        ],
        paperLink: [{
          required: true,
          validator: validateLink,
          trigger: 'blur'
        }],
        year: [{
          required: true,
          validator: validateNotNull,
          trigger: 'blur'
        }],
        tags: [
          {
            required: true,
            validator: validateTags,
            trigger: 'blur'
          }
        ],
        author: [
          {
            required: true,
            validator: validateAuthorArrayNotEmpty,
            trigger: 'blur'
          }
        ]
      }
    }
  },
  mounted () {
    this.getTopicList()
  },
  methods: {
    handleSubmit (name) {
      // console.log(name)
      // console.log(name)
      this.$refs[name].validate(valid => {
        if (valid) {
          const tags = this.form.topic.map(tag => { return { name: tag, type: 0 } }).concat(this.form.tags.split(' ').map(tag => { return { name: tag, type: 1 } }));
          const data = {
            abstract: tinymce.activeEditor.getContent(),
            tags: tags,
            // citation: this.form.citation,
            // source: this.form.citationUrl,
            published_year: this.form.year,
            source: this.form.paperLink,
            title: this.form.title,
            author: this.form.author.split(',')
          };
          console.log(data);
          createPaper('post', data).then(res => {
            this.$Message.success('发布成功!请等待审核！')
          }).catch(
            this.$Modal.error(getErrModalOptions(err))
          )
        } else {
          this.$Message.error('发布失败!')
        }
      });
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
    },
    handleReset (name) {
      this.$refs[name].resetFields()
    }
  }
}
</script>

<style>
form {
  margin-right: 200px;
}
</style>
