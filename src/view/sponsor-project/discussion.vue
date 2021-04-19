<template>
  <Card>
    <template v-if="type===1">
      <p slot='title'>所有讨论</p>
      <Table stripe :columns="columns" :data="discussionList" class='table'></Table>
      <Page :total="page_count" :page-size="1" style="text-align:center;margin-top:20px" @on-change="handlePageChange" />
      <Card dis-hover style="margin-top:20px" title='发布讨论'>
        <Form ref="form" :model="form" :rules='ruleCustom' label-position="top">
          <FormItem label="标题" prop='title'>
            <Input type="text" v-model='form.title'> </Input>
          </FormItem>
          <!-- <FormItem label="内容" prop='content'>
            <Input type="textarea" v-model="form.content" :rows='6'> </Input>
          </FormItem> -->
          <FormItem>
            <Button @click="handleSubmit" type="primary" style="text-align:center">发布</Button>
          </FormItem>
        </Form>
      </Card>
    </template>
    <template v-else>
      <div slot='title' style="height:auto">
        <Button @click="type=1" type='primary'>返回</Button>
        <p style="text-align:center;font-size:20px">{{discussion.title}}</p>
      </div>
      <comment v-bind="discussion.comments" :commentType="1"></comment>
      <Page :total="1" style="text-align:center;margin-top:20px" @on-change="handlePageChange" />
    </template>
  </Card>

</template>
<script>
import Comment from '@/components/comment/comment'
import { createDiscussion, queryDiscussions, queryDiscussion, deleteDiscussion } from '@/api/project'
import { getUserInfo } from '@/api/user'
import { getLocalTime } from '@/libs/util'
export default {
  components: {
    Comment
  },
  data () {
    return {
      type: 1,
      pindex: 1,
      psize: 10,
      discussionList: [],
      page_count: 1,
      hasNext: true,
      form: {
        title: '',
        content: ''
      },
      ruleCustom: {
        title: [{ required: true, trigger: 'blur', message: '请填写标题' }]
        // content: [{ required: true, trigger: 'blur', message: '请填写内容' }]
      },
      columns: [
        {
          title: '发表人',
          key: 'creator',
          className: 'user'
        },
        {
          title: '发表时间',
          key: 'createdAt'
        },
        {
          title: '标题',
          key: 'title',
          className: 'title'
        },
        // {
        //   title: '更新人',
        //   key: 'updater',
        //   className: 'user'
        // },
        {
          title: '更新时间',
          key: 'updatedAt'
        },
        {
          title: '操作',
          key: 'action',
          width: 150,
          align: 'center',
          render: (h, params) => {
            let same = this.$store.state.user.userId === params.row.created_by.id
            if (same) {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.handleRowClick(params.row, params.index)
                    }
                  }
                }, '查看'),
                h('Button', {
                  props: {
                    type: 'error',
                    size: 'small'
                  },
                  on: {
                    click: () => {
                      this.handleDelete(params.row, params.index)
                    }
                  }
                }, '删除')
              ])
            } else {
              return h('div', [
                h('Button', {
                  props: {
                    type: 'primary',
                    size: 'small'
                  },
                  style: {
                    marginRight: '5px'
                  },
                  on: {
                    click: () => {
                      this.handleRowClick(params.row, params.index)
                    }
                  }
                }, '查看')
              ])
            }
          }
        }
      ],

      discussion: {
        title: '我为什么这么强大',
        id: 0,
        comments: []
      }
    }
  },
  mounted () {
    this.loadDiscussions()
    this.getUserProfile()
  },
  methods: {
    async getUserProfile () {
      let username = this.$store.state.user.userName
      let userid = this.$store.state.user.userId
      if (username === '' || userid === '') {
        await getUserInfo().then(res => {
          this.$store.commit('setUserProfile', res.data)
          userid = res.data.id
          username = res.data.username
        }).catch(error => {
          this.$Modal.error(getErrModalOptions(error))
        })
      }
    },
    handleRowClick: async function (data, index) {
      let username = this.$store.state.user.userName
      let userid = this.$store.state.user.userId
      if (username === '' || userid === '') {
        await getUserInfo().then(res => {
          this.$store.commit('setUserProfile', res.data)
          userid = res.data.id
          username = res.data.username
        }).catch(error => {
          this.$Modal.error(getErrModalOptions(error))
        })
      }

      this.discussion.title = data.title
      this.discussion.id = data.id

      let header = {
        myName: username,
        micro_knowledge_id: this.discussion.id,
        myHeader: 'https://file.iviewui.com/dist/a0e88e83800f138b94d2414621bd9704.png',
        myId: userid
      }
      await queryDiscussion({
        topic_id: data.id,
        pindex: 1,
        psize: 999
      }).then(res => {
        console.log(res)
        this.discussion.comments = { ...header, comments_init: this.convertComments(res.data.topic_list) }
      }).catch(err => {
        console.log(err)
        this.discussion.comments = header
      })
      console.log(this.discussion)
      this.type = 2
    },
    handleSubmit: function () {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          createDiscussion({
            project_id: parseInt(this.$route.params['project_id']),
            title: this.form.title
          }).then(res => {
            this.$Message.success('发布成功')
            this.loadDiscussions()
          }).catch(err => {
            console.log(err)
          })
        } else {
          this.$Message.error('发布失败!')
        }
      })
    },
    handlePageChange: function (value) {
      this.pindex = value
      this.loadDiscussions(value)
    },
    convertComments: function (comments) {
      comments = comments.map(x => ({
        commentId: x.id,
        name: x.username,
        time: getLocalTime(x.created_at),
        id: x.user_id,
        comment: x.text,
        to: x.to_user ? x.to_user.username : 0,
        toId: x.to_user ? x.to_user.id : '',
        inputShow: false,
        parent_comment_id: x.parent_discussion_id,
        reply: [],
        headImg: 'https://file.iviewui.com/dist/a0e88e83800f138b94d2414621bd9704.png'
      }))
      let father_comments_map = {}
      comments.filter(x => (x.parent_comment_id === undefined)).forEach(x => {
        father_comments_map[x.commentId] = x
      })
      comments.forEach(x => {
        if (x.parent_comment_id !== undefined) {
          father_comments_map[x.parent_comment_id].reply.push(x)
        }
      })
      return Object.values(father_comments_map)
    },
    loadDiscussions (pindex = this.pindex) {
      queryDiscussions({
        project_id: parseInt(this.$route.params['project_id']),
        pindex: pindex,
        psize: this.psize
      }).then(res => {
        console.log(res)
        this.page_count = res.data.page_count
        this.discussionList = res.data.topic_list.map(x => ({
          id: x.id,
          title: x.title ? x.title : '',
          creator: x.created_by.nick_name === '' ? x.created_by.username : x.created_by.nick_name,
          createdAt: getLocalTime(x.start_time),
          updatedAt: getLocalTime(x.last_update_time),
          created_by: x.created_by
        }))
      }).catch(err => {
        console.log(err)
      })
    },
    handleDelete (row, index) {
      this.$Modal.confirm({
        title: '确认删除吗？',
        content: '删除后将无法恢复！',
        cancelText: '取消',
        onOk: () => {
          deleteDiscussion({
            id: row.id
          }).then(res => {
            this.$Message.success('删除成功！')
            this.loadDiscussions()
          })
        }
      })
    }
  }
}
</script>

<style>
.table td.title {
  font-size: 20px;
}
.table td.user {
  width: 50px;
}
</style>
