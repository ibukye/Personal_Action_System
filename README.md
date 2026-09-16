# 自分の行動特性に合わせたTODOアプリ

## 登録したCategory毎にTrue Goalを持ち、常に次の1歩だけを提示し、それを達成することでProgressが+1されるツール

### Data Model
Category    :   { name, true_goal }
Action      :   { category_id, next_step_text }
ProgressLog : { category_id, timestamp }

ここで、次の1歩は毎回Stepが終わるたびにUserが決める
もしその次の1歩が抽象的な場合(AIでの判断？)、画面全体に警告を表示し、具体的な目標が書かれるまで入力をしなおしてもらう


# UI設計
画面上にCategoryの大きいボタンを配置(4つとか？)
それをClickすると次の1歩が大きく表示される
(内部的にはTimerを付けておく)
終わったらこれを説明させるようなTextFieldを用いてちゃんと説明できなければ完了にさせることができない

# Framework
- React
- LocalStrage