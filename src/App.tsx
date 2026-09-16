import { useEffect, useState } from "react";
import "./App.css";
import Confetti from "./Confetti";

const CATEGORIES_KEY = "pas_categories";
const PROGRESS_KEY = "pas_progress_logs";
const DRINK_KEY = "pas_drink_bottle";


const DRINK_GOAL = 4; // ここを自分で調整



type Category = {
  id        : number,
  name      : string,
  true_goal : string,
  next_step_text: string, // 作成時に必須入力
};

function getGridColumns(count: number): number {
  if (count <= 1) return 1;
  if (count <= 4) return 2;
  return 3;
}

type ProgressLog = {
  category_id: number,
  step_text: string,  // 完了したstepの内容 
  timestamp: string
}







export default function App() {
  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem(CATEGORIES_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>(() => {
    const saved = localStorage.getItem(PROGRESS_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isViewingHistory, setIsViewingHistory] = useState(false);
  const [drinkBottle, setDrinkBottle] = useState<number>(() => {
    const saved = localStorage.getItem(DRINK_KEY);
    return saved ? JSON.parse(saved) : 0;
  });
  const [showConfetti, setShowConfetti] = useState(false);



  useEffect(() => {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressLogs));
  }, [progressLogs]);

  useEffect(() => {
    localStorage.setItem(DRINK_KEY, JSON.stringify(drinkBottle));
  }, [drinkBottle]);


  const handleAddCategory = (cat: Omit<Category, "id">) => {
    setCategories((prev) => [...prev, { ...cat, id: Date.now() }]);
    setIsAdding(false);
  };

  const handleDeleteCategory = (id: number) => {
    setCategories((prev) => prev.filter((cat) => cat.id !== id));
  }


  // 初回起動 : Categoryが一つもない
  if (categories.length === 0 && !isAdding) {
    return <OnboardingScreen onAdd={handleAddCategory} onFinish={() => setIsAdding(false)} />;
  }

  if (isAdding) {
    return (
      <AddCategoryForm
        onAdd={handleAddCategory}
        onCancel={() => setIsAdding(false)}
      />
    );
  }

  if (selectedCategory && isViewingHistory) {
    return (
      <HistoryScreen
        category={selectedCategory}
        logs={progressLogs}
        onBack={() => setIsViewingHistory(false)}
      />
    );
  }

  const handleComplete = (nextStepText: string) => {
    if (!selectedCategory) return;

    // 該当のCategoryのnext_step_text
    setCategories((prev) => 
      prev.map((category) => 
        category.id === selectedCategory.id
          ? { ...category, next_step_text: nextStepText }
          : category
      )
    );

    // Progressを記録
    setProgressLogs((prev) => [
      ...prev,
      { 
        category_id: selectedCategory.id, 
        step_text: selectedCategory.next_step_text,
        timestamp: new Date().toISOString() 
      },
    ]);

    // 一覧画面に戻る
    setSelectedCategory(null);
  }



  const handleDrinkBottle = () => {
    let num = drinkBottle;
    num += 1;
    if (num >= DRINK_GOAL) {
      num = 0;
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1500);
    }
    setDrinkBottle(num);
  };




  if (selectedCategory) {
    return (
      <NextActionScreen 
        category={selectedCategory}
        onBack={() => setSelectedCategory(null)}
        onComplete={handleComplete}
        onViewingHistory={() => setIsViewingHistory(true)}
      />
    );
  }

  const cols = getGridColumns(categories.length);
  
  return (
    <div className="app">
      {showConfetti && <Confetti />}
      <div className="app-header">
        <h1 className="app-title">Personal Action System</h1>
        <button className="edit-toggle" onClick={() => setIsEditing((v) => !v)}>
          {isEditing ? "完了" : "編集"}
        </button>
      </div>

      <div className="category-grid" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {categories.map((category) => {
          const count = progressLogs.filter((log) => log.category_id === category.id).length;
          return (
            <div key={category.id} className="category-card-wrapper">
              <button
                className="category-card"
                onClick={() => !isEditing && setSelectedCategory(category)}
              >
                <span className="category-name">{category.name}</span>
                <span className="category-progress">Progress: {count}</span>
              </button>
              {isEditing && (
                <button
                  className="delete-badge"
                  onClick={() => handleDeleteCategory(category.id)}
                  aria-label={`${category.name}を削除`}
                >
                  ×
                </button>
              )}
            </div>
          );
        })}

        <div key={"water"} className="category-card-wrapper">
          <button
            className="category-card"
            onClick={() => !isEditing && handleDrinkBottle()}
          >
            <span className="category-name">Drink Bottle</span>
            <span>drink water for 2L</span>
            <span className="category-progress">Progress: {drinkBottle}</span>
          </button>
        </div>

        {!isEditing && (
          <button className="add-card" onClick={() => setIsAdding(true)}>
            ＋
          </button>
        )}
      </div>
    </div>
  );
}






function NextActionScreen({ category, onBack, onComplete, onViewingHistory }: { 
  category: Category; 
  onBack: () => void; 
  onComplete: (nextStepText: string) => void; 
  onViewingHistory: () => void;
}) {
  
  const [isComplete, setIsComplete] = useState(false);
  const [nextStep, setNextStep] = useState("");


  const handleSubmit = () => {
    if (!nextStep.trim()) return; // 空では次に進めない
    onComplete(nextStep);
  };


  if (isComplete) {
    return (
      <div className="action-screen">
        <p className="action-label">{category.name} — お疲れ様！</p>
        <p className="action-subtitle">次の1歩は？</p>
        <input
          className="next-step-input"
          value={nextStep}
          onChange={(e) => setNextStep(e.target.value)}
          autoFocus
        />
        <button className="primary-button" onClick={handleSubmit}>登録する</button>
      </div>
    );
  }

  return (
    <div className="action-screen">
      <p className="action-label">{category.name}</p>
      <p className="next-step-text">{category.next_step_text}</p>
      <div className="action-buttons">
        <button className="primary-button" onClick={() => setIsComplete(true)}>完了</button>
        <button className="secondary-button" onClick={onBack}>戻る</button>
        <button className="secondary-button" onClick={onViewingHistory}>履歴</button>
      </div>
    </div>
  );
}








function OnboardingScreen({ onAdd }: { onAdd: (cat: Omit<Category, "id">) => void; onFinish: () => void; }) {
  const [name, setName] = useState("");
  const [trueGoal, setTrueGoal] = useState("");
  const [nextStep, setNextStep] = useState("");

  const handleAdd = () => {
    if (!name.trim() || !trueGoal.trim() || !nextStep.trim()) return;
    onAdd({ name, true_goal: trueGoal, next_step_text: nextStep });
    setName(""); setTrueGoal(""); setNextStep("");
  };

  return (
    <div className="onboarding-screen">
      <h1 className="app-title">はじめに、進めたいことを登録</h1>
      <p className="action-subtitle">いくつでもOK。少なめがおすすめ。</p>
      <input className="next-step-input" placeholder="カテゴリ名（例：FYP）" value={name} onChange={(e) => setName(e.target.value)} />
      <input className="next-step-input" placeholder="True Goal（最終的にどうなりたいか）" value={trueGoal} onChange={(e) => setTrueGoal(e.target.value)} />
      <input className="next-step-input" placeholder="最初の1歩" value={nextStep} onChange={(e) => setNextStep(e.target.value)} />
      <button className="primary-button" onClick={handleAdd}>追加する</button>
    </div>
  );
}


function AddCategoryForm({ onAdd, onCancel }: {
  onAdd: (cat: Omit<Category, "id">) => void;
  onCancel: () => void;
  }) {
    const [name, setName] = useState("");
  const [trueGoal, setTrueGoal] = useState("");
  const [nextStep, setNextStep] = useState("");

  const handleSubmit = () => {
    if (!name.trim() || !trueGoal.trim() || !nextStep.trim()) return;
    onAdd({ name, true_goal: trueGoal, next_step_text: nextStep });
  };

  return (
    <div className="onboarding-screen">
      <h2 className="app-title">新しいカテゴリを追加</h2>
      <input className="next-step-input" placeholder="カテゴリ名" value={name} onChange={(e) => setName(e.target.value)} autoFocus />
      <input className="next-step-input" placeholder="True Goal" value={trueGoal} onChange={(e) => setTrueGoal(e.target.value)} />
      <input className="next-step-input" placeholder="最初の1歩" value={nextStep} onChange={(e) => setNextStep(e.target.value)} />
      <div className="action-buttons">
        <button className="primary-button" onClick={handleSubmit}>追加</button>
        <button className="secondary-button" onClick={onCancel}>キャンセル</button>
      </div>
    </div>
  );
}




function HistoryScreen({ category, logs, onBack }: {
  category: Category;
  logs: ProgressLog[];
  onBack: () => void;
}) {
  const filtered = logs
    .filter((log) => log.category_id === category.id)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp));

    return (
      <div className="action-screen">
        <p className="action-label">{category.name} の履歴</p>
        {filtered.length === 0 ? (
          <p className="action-subtitle">まだ記録がありません</p>
        ) : (
          <ul className="history-list">
            {filtered.map((log, i) => (
              <li key={i} className="history-item">
                <span>{log.step_text}</span>
                <span className="history-time">
                  {new Date(log.timestamp).toLocaleString("ja-JP")}
                </span>
              </li>
            ))}
          </ul>
        )}
        <button className="secondary-button" onClick={onBack}>戻る</button>
      </div>
    );
}