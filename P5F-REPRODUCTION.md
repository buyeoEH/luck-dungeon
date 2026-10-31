# P5F 재현 안내

측정한 게임 소스는 d7e49ad7a68025b23c1b4a2d7f41509afb5ff37c, build030-p5-ce72b3283c2449f2이다. 최종 문서/측정 스크립트 커밋과 구분한다. 부모는 d276fbc8bd3a484b9431ef39b5b072835e6e0f5d이다. 별도 작업 디렉터리에서 정확한 소스로 빌드하고 최종 브랜치의 p5f-실험 스크립트만 가져와 실행한다. 원본 게임 파일을 다른 버전으로 덮어쓰지 않는다.

환경: Node24.22.1/jsdom26.1.0, Python3.12, NumPy, Playwright1.51.0/Chromium134. jsdom은 형제 p5-runtime/node_modules/jsdom에 두거나 P5_JSDOM_PATH로 지정한다.

부모 측정 자료: https://chatgpt.com/library?file_id=libfile_9afe53172de0819186fa8cf6ffda6219&account_id=personal
ZIP SHA256:2b31f0723e4789995c8fa9d5759426218d45b5b97f279110f2f343a73b738dc5. 이를 형제 p5-next-evidence/에 압축 해제한다. 새로운 자료 ZIP의 p5f-fork/,p5f-fixed/,p5f-tests/는 작업 디렉터리 p5f-runtime/ 아래에 재현/분석할 수 있다.

1. python prepare_site.py → python build_v0219_preview.py → python build_v0220.py → python build_v030.py. source_tree_dirty=false와 위buildID 확인.
2. python p5f-setup.py로7442개 C 분기/2800개 C 고정 대조 입력과 공통 job 구성을 준비한다.
3. node p5f-run.cjs 0 fork --smoke 및 fixed --smoke. 서로 다른 smoke디렉터리를 쓴다.
4. python p5f-batches.py fork, python p5f-batches.py fixed. 네 워커가 시드 나머지로 나뉘고 프로세스당120개 신규 실행 후 이어간다. 중복 키는 seed/profile/target/variant다.
5. 실제 파일 행과 유일 키를 확인한다. fork 7412/7412/7408/7536=29768, fixed 각2800=11200. 진행 메타데이터 숫자만으로 완료 판정하지 않는다.
6. 모든 C 분기는 이전7442개 C의 통계/난수/보상 경로와, 모든 C 고정은 이전2800개 결과와 완전히 같아야 한다. 사전 상태 해시는 모든 variant에서 이전 상태와 같아야 한다.
7. OPENBLAS_NUM_THREADS=1 python p5f-analyze.py로 summary.json과 표를 생성한다. P5F-PROTOCOL.md의 사전 지정 층 및 tie 규칙을 유지한다. 결과에 맞춰 선택기/층을 수정하지 않는다.

P5F 프리픽스는 이전 실험과 동일하게 P5 OFF로 원래 방문 경로를 재현하고, 대상 보상에서만 A/B/C/씨앗3 효과를 적용한다. p5Finish 이후 C/씨앗8로 복귀한다. 따라서 ‘새 규칙을 모든 혼합 보상에 지속 적용한 정책’ 결과가 아니다. fixed 실험은 별도로 지속 고정한다.

브라우저 검사는 test-p5f-browser.py를 실행한다. 24개 분기의 통계/RNG/정규화 이벤트/상태 해시를 Node와 비교하고9개 모바일 흐름을 검사한다. 무작위 인스턴스 UUID는 이벤트 비교에서 정규화한다. 이미지/미디어 로드를 차단한 입력 흐름 검사이며 전체 이미지 시각 품질/실기기 Safari 검사로 표기하지 않는다.

용량 점검은 기존 D 커밋을 형제 p5f-size-base/에서 빌드하고 build_v030_standalone.py를 실행한 뒤 audit_html_size.py, test-standalone-audio-audit.py로 재현한다. ffprobe/Pillow를 사용했다. 기존 HTML SHA256은76f695e6b4479df7d8ec3ae72745786d6fcb78d20de1b0c2ef547d5bf1f6150a. 음원 실패를 재현하는 검사는 ‘음원 정상 재생 통과’가 아니다.

검토 플래그: ?restock=A/B/C/legacy, ?seeds=3/8, ?p5=0. 기본은 C/3. legacy는 기본+3/랜덤+1만 복원한다. p5=0은 P5전체를 끈다. 실행 중 설정을 바꾸지 않고 새로 로드한 게임에서 비교한다. 최종 제출 후에도 main/부모 브랜치는 변경하지 않고 Draft PR로 남긴다.
