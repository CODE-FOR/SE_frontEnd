<template>
  <div class="user-avatar-dropdown">
    <Dropdown @on-click="handleClick">
      <Badge :dot="!!messageUnreadCount">
        <Avatar :src="icon" />
      </Badge>
      <Icon :size="18" type="md-arrow-dropdown"></Icon>
      <DropdownMenu slot="list">
        <DropdownItem name="message">
          消息中心<Badge
            style="margin-left: 10px"
            :count="messageUnreadCount"
          ></Badge>
        </DropdownItem>
        <DropdownItem name="chat"> 聊天列表 </DropdownItem>
        <DropdownItem name="modify">个人中心</DropdownItem>
        <DropdownItem name="logout">退出登录</DropdownItem>
      </DropdownMenu>
    </Dropdown>
  </div>
</template>

<script>
import "./user.less";
import { mapActions } from "vuex";
import { getUserInfo } from "@/api/user";
export default {
  name: "User",
  props: {
    userAvatar: {
      type: String,
      default: "",
    },
    messageUnreadCount: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      icon: "",
    };
  },
  mounted() {
    /**
     * @description: 利用icon是否为空判断session是否丢失，若丢失则重新加载userProfile
     */
    this.icon = this.userAvatar;
    if (this.icon.length == 0) {
      getUserInfo().then((res) => {
        console.log(res.data);
        this.$store.commit("setUserProfile", res.data);
        this.icon = this.$store.state.user.icon;
      });
    }
  },
  methods: {
    ...mapActions(["handleLogOut"]),
    logout() {
      this.handleLogOut().then(() => {
        this.$router.push({
          name: "login",
        });
      });
    },
    message() {
      this.$router.push({
        name: "message_page",
      });
    },
    modify() {
      this.$router.push({
        name: "user_info",
        params: {
          id: this.$store.state.user.userId,
        },
      });
    },
    chat() {
      this.$router.push({
        name: "chat",
      });
    },
    handleClick(name) {
      switch (name) {
        case "logout":
          this.logout();
          break;
        case "message":
          this.message();
          break;
        case "modify":
          this.modify();
          break;
        case "chat":
          this.chat();
      }
    },
  },
};
</script>
