import React, { useState, useEffect } from "react";
import { Star, Plus, Edit2, Trash2, Save, X, RefreshCw } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// 앨범 평가 프로그램 메인 컴포넌트
export default function AlbumRatingApp() {
  // 앨범 목록 상태 관리
  const [albums, setAlbums] = useState([]);

  // 로딩 상태
  const [isLoading, setIsLoading] = useState(true);

  // 저장 중 상태
  const [isSaving, setIsSaving] = useState(false);

  // 정렬 기준 상태
  const [sortBy, setSortBy] = useState('rating-desc');

  // 새 앨범 추가 모델 표시 여부
  const [showAddModal, setShowAddModal] = useState(false);

  // 앨범 편집 모드 상태
  const [editingId, setEditingId] = useState(null);

  // 새 앨범 입력 데이터
  const [newAlbum, setNewAlbum] = useState({
    cover: '',
    title: '',
    artist: '',
    review: '',
    rating: 0
  });

  // 편집 중인 앨범 데이터
  const [editingAlbum, setEditingAlbum] = useState(null);

  // 클로드 저장소에서 앨범 데이터 불러오기
const loadAlbumsFromStorage = async () => {
  setIsLoading(true);
  try {
    const { data, error } = await supabase
      .from("albums")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    setAlbums(data || []);
  } catch (error) {
    console.error("데이터 불러오기 실패:", error);
    alert("데이터 불러오기에 실패했습니다.");
  } finally {
    setIsLoading(false);
  }
};

useEffect(() => {
  loadAlbumsFromStorage();
}, []);

  // 새 앨범 추가 함수
const handleAddAlbum = async () => {
  if (!newAlbum.title || !newAlbum.artist) {
    alert("앨범 제목과 아티스트는 필수입니다!");
    return;
  }

  setIsSaving(true);

  try {
    const { error } = await supabase.from("albums").insert([newAlbum]);
    if (error) throw error;

    await loadAlbumsFromStorage();
    setShowAddModal(false);

    setNewAlbum({ cover: '', title: '', artist: '', review: '', rating: 0 });

  } catch (error) {
    console.error(error);
    alert("저장 실패");
  } finally {
    setIsSaving(false);
  }
};

  // 앨범 삭제 함수
const handleDeleteAlbum = async (id) => {
  if (!window.confirm("정말 삭제하시겠습니까?")) return;

  setIsSaving(true);

  try {
    const { error } = await supabase.from("albums").delete().eq("id", id);
    if (error) throw error;

    await loadAlbumsFromStorage();
  } catch (error) {
    alert("삭제 실패");
  } finally {
    setIsSaving(false);
  }
};

  // 앨범 편집 시작 함수
  const startEditing = (album) => {
    setEditingId(album.id);
    setEditingAlbum({ ...album });
  };

  // 앨범 편집 저장 함수
const saveEditing = async () => {
  setIsSaving(true);

  try {
    const { error } = await supabase
      .from("albums")
      .update(editingAlbum)
      .eq("id", editingId);

    if (error) throw error;

    await loadAlbumsFromStorage();
    setEditingId(null);
    setEditingAlbum(null);

  } catch (error) {
    alert("업데이트 실패");
  } finally {
    setIsSaving(false);
  }
};

  // 앨범 편집 취소 함수
  const cancelEditing = () => {
    setEditingId(null);
    setEditingAlbum(null);
  };

  // 앨범 목록 정렬 함수
  const getSortedAlbums = () => {
    const sorted = [...albums];

    switch(sortBy) {
      case 'rating-desc': // 평점 높은순
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'rating-asc': // 평점 낮은순
        return sorted.sort((a, b) => a.rating - b.rating);
      case 'title-asc': // 제목 오름차순
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case 'title-desc': // 제목 내림차순
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case 'artist-asc': // 아티스트 오름차순
        return sorted.sort((a, b) => a.artist.localeCompare(b.artist));
      case 'artist-desc': // 아티스트 내림차순
        return sorted.sort((a, b) => b.artist.localeCompare(a.artist));
      default:
        return sorted;
    }
  };

  // 별점 렌더링 함수
  const renderStars = (rating, onChange, isEditable = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={20}
            className={`${
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            } ${isEditable ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={() => isEditable && onChange(star)}
          />
        ))}
      </div>
    );
  };

  // 로딩 중 화면
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">앨범 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                이세진의 앨범 평가 모음
              </h1>
              <p className="text-gray-600">
                모든 사용자가 함께 앨범을 추가하고 평가합니다
              </p>
              <p className="text-sm text-purple-600 mt-1">
                Claude 저장소 사용 중 - 실시간 동기화
              </p>
            </div>

            {/* 앨범 추가 및 새로고침 버튼 */}
            <div className="flex gap-3">
              <button
                onClick={loadAlbumsFromStorage}
                disabled={isSaving}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md disabled:opacity-50"
                title="최신 데이터 불러오기"
              >
                <RefreshCw size={20} />
                새로고침
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                disabled={isSaving}
                className="flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors shadow-md disabled:opacity-50"
              >
                <Plus size={20} />
                앨범 추가
              </button>
            </div>
          </div>

          {/* 저장 중 표시 */}
          {isSaving && (
            <div className="mt-3 text-sm text-blue-600 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              저장 중...
            </div>
          )}

          {/* 정렬 옵션 */}
          <div className="mt-4 flex items-center gap-4">
            <span className="text-gray-700 font-medium">정렬:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="rating-desc">평점 높은순</option>
              <option value="rating-asc">평점 낮은순</option>
              <option value="title-asc">제목 (가나다순)</option>
              <option value="title-desc">제목 (역순)</option>
              <option value="artist-asc">아티스트 (가나다순)</option>
              <option value="artist-desc">아티스트 (역순)</option>
            </select>
            <span className="text-gray-500">
              총 {albums.length}개의 앨범
            </span>
          </div>
        </div>

        {/* 앨범 목록 */}
        {albums.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <p className="text-gray-500 text-lg">
              아직 추가된 앨범이 없습니다.<br />
              '앨범 추가' 버튼을 눌러 첫 앨범을 추가해보세요!<br />
              <span className="text-sm text-purple-600 mt-2 block">
                모든 사용자가 같은 앨범 목록을 공유합니다
              </span>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getSortedAlbums().map((album) => (
              <div key={album.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                {/* 앨범 커버 이미지 */}
                <div className="h-64 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center overflow-hidden">
                  {album.cover ? (
                    <img 
                      src={album.cover}
                      alt={album.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="text-gray-500 text-6xl">🎵</div>';
                      }}
                    />
                  ) : (
                    <div className="text-gray-500 text-6xl">🎵</div>
                  )}
                </div>

                <div className="p-4">
                  {/* 편집 모드가 아닐 때 */}
                  {editingId !== album.id ? (
                    <>
                      {/* 앨범 제목 */}
                      <h3 className="text-xl font-bold text-gray-800 mb-1 truncate">
                        {album.title}
                      </h3>

                      {/* 아티스트 */}
                      <p className="text-gray-600 mb-3 truncate">
                        {album.artist}
                      </p>

                      {/* 별점 */}
                      <div className="mb-3">
                        {renderStars(album.rating)}
                      </div>

                      {/* 평가 내용 */}
                      {album.review && (
                        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
                          {album.review}
                        </p>
                      )}

                      {/* 수정/삭제 버튼 */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => startEditing(album)}
                          disabled={isSaving}
                          className="flex-1 flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                          <Edit2 size={16} />
                          수정
                        </button>
                        <button
                          onClick={() => handleDeleteAlbum(album.id)}
                          disabled={isSaving}
                          className="flex-1 flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          <Trash2 size={16} />
                          삭제
                        </button>
                      </div>
                    </>
                  ) : (
                    /* 편집 모드 */
                    <>
                      {/* 앨범 커버 URL 입력 */}
                      <input
                        type="text"
                        placeholder="앨범 커버 URL"
                        value={editingAlbum.cover}
                        onChange={(e) => setEditingAlbum({...editingAlbum, cover: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      {/* 앨범 제목 입력 */}
                      <input
                        type="text"
                        placeholder="앨범 제목"
                        value={editingAlbum.title}
                        onChange={(e) => setEditingAlbum({...editingAlbum, title: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      {/* 아티스트 입력 */}
                      <input
                        type="text"
                        placeholder="아티스트"
                        value={editingAlbum.artist}
                        onChange={(e) => setEditingAlbum({...editingAlbum, artist: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      {/* 별점 선택 */}
                      <div className="mb-3">
                        {renderStars(
                          editingAlbum.rating,
                          (rating) => setEditingAlbum({...editingAlbum, rating}),
                          true
                        )}
                      </div>

                      {/* 평가 내용 입력 */}
                      <textarea
                        placeholder="앨범에 대한 평가를 작성해주세요"
                        value={editingAlbum.review}
                        onChange={(e) => setEditingAlbum({...editingAlbum, review: e.target.value})}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-4 h-20 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />

                      {/* 저장/취소 버튼 */}
                      <div className="flex gap-2">
                        <button
                          onClick={saveEditing}
                          disabled={isSaving}
                          className="flex-1 flex items-center justify-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50"
                        >
                          <Save size={16} />
                          저장
                        </button>
                        <button
                          onClick={cancelEditing}
                          disabled={isSaving}
                          className="flex-1 flex items-center justify-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                        >
                          <X size={16} />
                          취소
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 앨범 추가 모델 */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                새 앨범 추가
              </h2>

              {/* 앨범 커버 URL 입력 */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  앨범 커버 URL (선택)
                </label>
                <input
                  type="text"
                  placeholder="https://example.com/cover.jpg"
                  value={newAlbum.cover}
                  onChange={(e) => setNewAlbum({...newAlbum, cover: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 foucs:ring-purple-500"
                />
              </div>

              {/* 앨범 제목 입력 */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  앨범 제목 *
                </label>
                <input
                  type="text"
                  placeholder="앨범 제목을 입력하세요"
                  value={newAlbum.title}
                  onChange={(e) => setNewAlbum({...newAlbum, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* 아티스트 입력 */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  아티스트 *
                </label>
                <input
                  type="text"
                  placeholder="아티스트의 이름을 입력하세요"
                  value={newAlbum.artist}
                  onChange={(e) => setNewAlbum({...newAlbum, artist: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* 별점 선택 */}
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  평점
                </label>
                {renderStars(
                  newAlbum.rating,
                  (rating) => setNewAlbum({...newAlbum, rating}),
                  true
                )}
              </div>

              {/* 평가 내용 입력 */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2">
                  평가 (선택)
                </label>
                <textarea
                  placeholder="앨범에 대한 평가를 작성해주세요"
                  value={newAlbum.review}
                  onChange={(e) => setNewAlbum({...newAlbum, review: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* 추가/취소 버튼 */}
              <div className="flex gap-3">
                <button
                  onClick={handleAddAlbum}
                  disabled={isSaving}
                  className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
                >
                  추가하기
                </button>
                <button
                  onClick={() => setShowAddModal(false)}
                  disabled={isSaving}
                  className="flex-1 bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400 transition-colors font-medium disabled:opacity-50"
                >
                  취소
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}