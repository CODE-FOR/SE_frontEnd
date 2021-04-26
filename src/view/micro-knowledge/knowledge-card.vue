<template>
  <div>
    <card :bordered="false" dis-hover :style="citeStyle">
      <div slot="title">
        发布者:
        <a @click.prevent="showUser" :id="id">{{ creator['username'] === '' ? '未知用户' : creator['username']}}</a>
        <Modal v-model="showUserControl" footer-hide>
          <Row>
            <i-col span="4">
              <Avatar src="https://file.iviewui.com/dist/a0e88e83800f138b94d2414621bd9704.png" style="width: 100%;height: 100%" />
            </i-col>
            <i-col span="10">
              <div class="user-name">
                {{ userInfo.username }}
              </div>
              <p style="margin-top: 5px"> 邮箱: {{ userInfo.email || '暂无邮箱信息' }} </p>
              <p> 所属组织: {{ userInfo.institution || '暂无组织信息'}} </p>
            </i-col>
          </Row>
          <Divider />
          <Row>
            <i-col span="8" style="text-align: center; font-size: 18px">
              <p class="data-title"> 总发布数 </p>
              <p> {{ userInfo.total_post }} </p>
            </i-col>
            <i-col span="8" style="text-align: center; font-size: 18px">
              <p class="data-title"> 总粉丝数 </p>
              <p> {{ userInfo.total_fan }} </p>
            </i-col>
            <i-col span="8" style="text-align: center; font-size: 18px">
              <p class="data-title"> 总点赞数 </p>
              <p> {{ userInfo.total_like }} </p>
            </i-col>
          </Row>
          <Divider />
          <Row>
            <i-col span="7" offset="4">
              <i-button v-if="!userInfo.is_following" style="width: 100%" @click="handleFollow">
                关注
              </i-button>
              <i-button v-else style="width: 100%" type="primary" @click="handleFollow">
                取消关注
              </i-button>
            </i-col>
            <i-col span="7" offset="2">
              <i-button type="primary" style="width: 100%" @click="jumpUserInfo(userInfo.id)">
                他的主页
              </i-button>
            </i-col>
          </Row>
        </Modal>
      </div>
      <!-- <p slot="extra">{{ kind === 0 ? '微证据' : '微猜想' }}发布于: {{ createAt }}</p> -->
      <template v-if="kind === 0">
        <Row>
          {{ title }}
        </Row>
      </template>
      <p slot="extra">{{ kind === 0 ? '论文' : '论文解读' }}发布于: {{ createAt }}</p>
      <Row v-html="htmlvalue"></Row>
      <!-- <Row>{{ content }}</Row> -->
      <br />
      <template v-if="kind === 0">
        <Row>
          参考文献: <a :href='source'> {{citation}} </a> ( {{ publishedYear }} )
        </Row>
        <br>
      </template>
      <Modal v-model="detailController" :footer-hide="true">
        <Divider />
        <Row v-for="item in evidences" :key="item.id">
          <i-col style="font-size: 18px">
            {{ item.content }}
          </i-col>
          <br>
          <i-col style="font-size: 14px">
            参考文献: <a :href='item.source'> {{item.citation}} </a>
          </i-col>
          <i-col style="font-size: 14px">
            由 <a @click.prevent="jumpUserInfo(item.created_by.id)"> {{ item.created_by.username }} </a> 发布于：{{ getTime(item.created_at) }}
          </i-col>
          <Divider />
        </Row>
      </Modal>
      <Row>
        <Tag v-for="(tag, index) in tags" :key="index" class="sysTopics">{{ tag.name }}</Tag>
      </Row>
      <br />
      <template v-if="displayType === 0">
        <Row>
          <i-col span="12">
            <ButtonGroup>
              <i-button @click="onLike" style="font-size: 14px">
                <Icon type="md-thumbs-up" :color="likeColor" />
                点赞 {{ totalLike }}
              </i-button>
              <i-button @click="onCollect" style="font-size: 14px">
                <Icon :type="collectType" :color="collectColor" />
                收藏 {{ totalFavor }}
              </i-button>
              <i-button @click="onComment" style="font-size: 14px">
                <Icon type="ios-chatbubbles" />
                评论
              </i-button>
            </ButtonGroup>
          </i-col>
          <i-col v-if="kind === 1" offset="9" span="3" style="padding-top: 7px">
            <a href="#" @click.prevent="showDetail"> 查看参考 </a>
          </i-col>
        </Row>
        <Card v-if='showComment' style="margin-top: 10px;">
          <comment v-bind='comments'></comment>
        </Card>
      </template>
      <template v-else-if="displayType === 1">
        <Button class="cite" @click="onCite" type="primary">{{citeMessage}}</Button>
      </template>
    </card>
    <Divider />
  </div>
</template>

<script>
import { favorMicroKnowledge, likeMicroKnowledge, getMicroknowledgeComments, microKnowledgeIdReq } from '@/api/microknowledge.js'
import { follow, unfollow, getUserInfo } from '@/api/user'
import { getErrModalOptions, getLocalTime } from '@/libs/util'
import comment from '@/components/comment/comment.vue'
export default {
  name: 'KnowledgeCard',
  components: {
    comment
  },
  props: {
    id: {
      type: Number,
      default: 0
    },

    creator: {
      type: Object,
      default: () => {
        return {
          username: 'xx',
          id: '0'
        }
      }
    },

    kind: { // 0: 微证据, 1: 微猜想
      type: Number,
      default: 0
    },

    citeMessageInit: {
      type: String,
      default: '引用'
    },

    createAt: {
      type: String,
      default: '年/月/日'
    },
    
    content: {
      type: String,
      default: '这是一个展示示例'
    },

    tags: {
      type: Array,
      default: () => {
        return []
      }
    },

    isLike: {
      type: Boolean,
      default: false
    },

    isCollect: {
      type: Boolean,
      default: false
    },

    likeNumber: {
      type: Number,
      default: 0
    },

    favorNumber: {
      type: Number,
      default: 0
    },

    displayType: {
      type: Number,
      default: 0
    },

    source: { // 微证据专用
      type: String,
      default: ''
    },

    citation: { // 微证据专用
      type: String,
      default: ''
    },

    publishedYear: {
      type: Number,
      default: 0
    },

    evidences: {
      type: Array,
      default: () => {
        return []
      }
    },

    // TODO: add title but not used yet
    title: {
      type: String,
      default: ''
    }
  },

  data () {
    return {
      htmlvalue: this.$props.content,
      like: this.$props.isLike,
      totalLike: this.$props.likeNumber,
      totalFavor: this.$props.favorNumber,
      collect: this.$props.isCollect,
      cited: false,
      showComment: false,
      comments: [],
      detailController: false,
      showUserControl: false,
      userInfo: {},
      followText: '',
      title: 'test'
    }
  },

  computed: {
    likeColor: function () {
      return this.like ? '#0084ff' : '#747b8b'
    },

    collectType: function () {
      return this.collect ? 'ios-heart' : 'ios-heart-outline'
    },

    collectColor: function () {
      return this.collect ? '#fb7299' : 'default'
    },

    citeStyle: function () {
      return this.cite ? 'margin-left:100px;' : ''
    },

    citeMessage: function () {
      return this.cited ? '取消' : this.citeMessageInit
    },

    popId: function () {
      return 'pop' + this.$props.id
    }
  },

  methods: {
    onLike: function () {
      this.like = !this.like
      if (this.like) {
        this.totalLike += 1
      } else {
        this.totalLike -= 1
      }
      likeMicroKnowledge('post', this.$props.id).then(res => {
        const info = this.like ? '成功点赞' : '成功取消点赞'
        this.$Message.info(info)
      }).catch(error => {
        this.$Modal.error(getErrModalOptions(error))
      })
    },

    onCollect: function () {
      this.collect = !this.collect
      if (this.collect) {
        this.totalFavor += 1
      } else {
        this.totalFavor -= 1
      }
      favorMicroKnowledge('post', this.$props.id, this.collect ? 'favor' : 'unfavor').then(res => {
        const info = this.collect ? '成功收藏' : '成功取消收藏'
        this.$Message.info(info)
      }).catch(error => {
        this.$Modal.error(getErrModalOptions(error))
      })
    },

    onComment: async function () {
      await this.getComments()
      this.showComment = !this.showComment
    },

    onCite: function () {
      this.cited = !this.cited
      this.$emit('cite-event', { id: this.id, content: this.content, cited: this.cited })
    },

    showDetail: function () {
      if (this.evidences.length === 0) {
        microKnowledgeIdReq(this.id, this.kind, 'get').then(res => {
          this.evidences = res.data.evidences
          this.detailController = true
        }).catch(error => {
          console.log(error)
        })
      } else {
        this.detailController = true
      }
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
        headImg: 'https://file.iviewui.com/dist/a0e88e83800f138b94d2414621bd9704.png',
        parent_comment_id: x.parent_comment_id,
        reply: []
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

    getComments: async function () {
      let username = ''
      let userid = ''
      await getUserInfo().then(res => {
        userid = res.data.id
        username = res.data.username
      }).catch(error => {
        this.$Modal.error(getErrModalOptions(error))
      })
      let header = {
        myName: username,
        micro_knowledge_id: this.id,
        myHeader: 'https://file.iviewui.com/dist/a0e88e83800f138b94d2414621bd9704.png',
        myId: userid
      }
      await getMicroknowledgeComments('get', {
        micro_knowledge_id: this.id,
        pindex: 1,
        psize: 20
      }).then(res => {
        this.comments = { ...header, comments_init: this.convertComments(res.data.comment_list) }
        console.log(this.comments)
      }).catch(err => {
        console.log(err)
        this.comments = header
      })
    },

    showUser: function () {
      getUserInfo(this.$props.creator.id).then(res => {
        this.showUserControl = true
        this.userInfo = res.data
      }).catch(error => {
        this.$Modal.error(getErrModalOptions(error))
      })
    },

    handleFollow: function () {
      if (this.userInfo.is_following) {
        unfollow(this.creator.id).then(res => {
          this.userInfo.is_following = false
          this.userInfo.total_fan -= 1
          this.$Message.info('成功取消关注')
        }).catch(error => {
          this.$Modal.error(getErrModalOptions(error))
        })
      } else {
        follow(this.creator.id).then(res => {
          this.userInfo.is_following = true
          this.userInfo.total_fan += 1
          this.$Message.info('成功关注')
        }).catch(error => {
          this.$Modal.error(getErrModalOptions(error))
        })
      }
    },

    jumpUserInfo: function (id) {
      this.$router.push({
        name: 'user_info',
        params: {
          id: id
        }
      })
    },

    getTime: function (time) {
      return getLocalTime(time)
    }
  }
}
</script>

<style>
.user-name {
  font-size: 26px;
  color: #4d4d4d;
}
.data-title {
  font-size: 18px;
  font-weight: bold;
}
</style>
