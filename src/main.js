import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import "./style.css"
import NotificationContainer from "./components/common/NotificationContainer.vue"

const app = createApp(App)
app.use(router)
app.component("NotificationContainer", NotificationContainer)
app.mount("#app")
