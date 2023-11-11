import {notifications} from "@mantine/notifications";

export function showErrorMessage(msg: string, title: string = "视频处理出错") {
    notifications.show({
        title: title,
        message: msg,
        color: 'red',
        autoClose: false
    })
}

export function showWarningMessage(msg: string, title: string = "注意", autoClose: boolean | number = false) {
    notifications.show({
        title: title,
        message: msg,
        color: 'yellow',
        autoClose: autoClose,
    })
}
