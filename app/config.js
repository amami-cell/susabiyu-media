// すさび湯 確認アプリ 設定
// GAS_URL: GASウェブアプリの /exec URL（スプレッドシート Config!B14 の「承認URL」と同じ）
//          末尾は「.../exec」。デプロイ時に必ず実物に差し替える。
window.SUSABIYU = {
  GAS_URL: "https://script.google.com/macros/s/AKfycbxKn_MUfPgJ0nA8LJPp6YGb2Jehp9G8CpckV5bOAhe3M53eBC3Kle3O3Bf7mFzUJ2TMQw/exec",
  STORE_NAME: "すさび湯三条",
  POLL_MS: 4000,  // 最新チェックの間隔（ミリ秒）。短いほど他端末の反映が速い
  // Web Push の公開鍵（applicationServerKey）。公開情報なのでここに置いてOK。
  VAPID_PUBLIC: "BFDIPEHslhSqZlE4QooHXikxgv-25YJEDmESsYVxLXFnrmPWLO8aQGoVFYTUWO5nn_QpkUAiCtb1QZprcMCNIuc"
};
