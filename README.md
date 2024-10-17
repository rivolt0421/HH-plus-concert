# 콘서트 티켓 예약 시스템

### Milestone

1. 분석 및 설계, 개발 환경 준비
   - 시퀀스 다이어그램 작성 (`1d`)
   - API 명세 작성 (`1d`)
   - ERD 설계 (`1d`)
2. 기능 구현, 테스트 작성
   - 기능 구현
      - 서비스 구성 설계와 도메인 객체 설계, 단위 테스트 작성 (1d)
      - 유즈케이스 구성, 인터페이스 작성 (1d)
      - 통합 테스트 작성 (1d)
3. 심화 기능 구현, 리팩토링
   - 다수의 요청 동기화
   - 토큰 리프레시 설정
   - 배치 / 스케줄러 개선
   - NestJS 테크닉을 통한 코드 개선
4. 부하 테스트, 병목 개선
   - 부하 테스트 분석 보고서 작성
   - 병목 지점 파악 및 개선
5. E2E 테스트 작성, 배포 준비
   - API 단위의 E2E 테스트 작성
   - 배포 전략 도입
   - 최종 문서화

### API 명세

[Concert Ticketing API](https://rivolt0421.github.io/HH-plus-concert/)

### Sequence Diagram

**대기열 토큰 발급 및 조회**
```mermaid
sequenceDiagram
  actor a as User
  participant b as Auth Server
  participant c as DB

  Note left of a: 토큰 발급 요청
  a ->> +b: 대기열 토큰 발급 요청 (email, password)
  b ->> c: 유저 검증 (UUID exists?)
  alt 유저 정보 존재 X
    c -->> b: UUID 조회 실패
    b -->> a: Error - User Not Exists
  else 유저 정보 존재 O
    c -->> b: UUID 반환
    b ->> c: 대기번호 값 증가 및 조회
    c -->> b: 증가된 대기번호 값 반환
    b -->> -a: 대기열 토큰 발급 (UUID, 대기 번호)
  end

  Note left of a: 대기 상태 조회
  a ->> +b: 대기 상태 조회 요청 (with Token)
  b ->> c: 완료된 요청 개수 조회
  c -->> b: 반환
  b ->> b: 완료된 요청 개수에 수용 가능 인원을 더한 값과 토큰의 대기번호를 비교
  b -->> -a: 남은 대기 인원 수 전송

  Note left of a: 대기열로 보호된 API 요청
  a ->> +b: API 요청
  b ->> c: 완료된 요청 개수 조회
  c -->> b: 반환
  b ->> b: "완료된 요청 개수"에 "수용 가능 인원"을 더한 값(카운터)과 토큰의 대기번호를 비교
  alt 카운터 < 대기번호
    b -->> a: Error - Not Your Turn
  else 대기번호 <= 카운터
    b ->> b: 요청 처리
    b -->> -a: 처리 결과 전송
  end
```

**토큰 만료 배치 프로세스**
```mermaid
sequenceDiagram
    participant Scheduler
    participant BatchProcess
    participant Database

    %% 1분마다 자동 실행
    Scheduler->>BatchProcess: 매 1분 실행(자동 트리거)

    %% 만료 토큰 조회 및 처리
    BatchProcess->>Database: 토큰 만료 처리 (만료시간 <= 현재시간 and 완료되지 않음)
    
    %% 만료 토큰 업데이트
    Database-->>BatchProcess: 업데이트 된 토큰의 개수 반환
    
    BatchProcess->>Database: 업데이트 된 토큰의 개수 만큼 '완료된 요청 개수' 증가
    
    %% 최종 결과 반영
    Database-->>BatchProcess: 업데이트 성공
```

**날짜 및 좌석 조회**
```mermaid
sequenceDiagram
  actor User as User
  participant Server as Server
  participant DB as DB

  Note left of User: 예약 가능한 날짜 조회
    User ->> +Server: 예약 가능한 날짜 조회 요청
    Server ->> DB: 예약 가능한 날짜 조회
    DB -->> Server: 예약 가능한 날짜 목록 반환
    Server -->> -User: 예약 가능한 날짜 목록 전송
  Note left of User: 예약 가능한 좌석 조회
    User ->> +Server: 특정 날짜의 예약 가능한 좌석 조회 요청
    Server ->> DB: 해당 날짜의 예약 가능한 좌석 조회
    DB -->> Server: 예약 가능한 좌석 목록 반환
    Server -->> -User: 예약 가능한 좌석 목록 전송
```

**좌석 예약**
```mermaid
sequenceDiagram
  actor a as User
  participant b as Server
  participant c as DB

  a ->> b: 좌석 예약 요청 (날짜, 좌석 번호)
  Note over b: A
  b ->> c: 해당 좌석의 예약 정보 조회
  c -->> b: 예약 정보 반환
  b ->> b: 유효한 예약이 하나라도 있는지 확인
  alt 유효한 예약 존재하는 경우
    b -->> a: Error - Seat is already occupied
  else 유효한 예약 없는 경우
    b ->> c: 5분간 유효한 예약 정보 저장 (w/ 좌석 버전)
    alt 저장 성공
        c -->> b: 저장 성공
        b -->> a: 좌석 예약 성공 응답
    else 저장 실패
        c -->> b: 저장 실패
        b ->> b: A 부터 다시 시도
    end
  end
```

**결제**
```mermaid
sequenceDiagram
  actor U as User
  participant P as Payment Module
  participant S as Server
  participant D as Database

  U ->> P: 결제 요청 (지불 정보, 예약 정보, 세션 정보)
  activate P
  P ->> P: 결제 처리
  alt 지불 성공
    Note left of U: 지불 성공
    P ->> S: 결제 완료 콜백 (w/ 결제 정보, 좌석 id, 세션 id)
    deactivate P
    activate S
    S ->> D: 좌석 예약 정보 조회
    activate D
    D -->> S: 좌석 예약 정보 반환
    alt 사용자의 유효한 예약 존재
      Note over U: 사용자의 유효한 예약 존재
      S ->> D: 결제 정보 생성 (w/ 좌석 버전)
      alt 결제 정보 생성 성공
      Note right of U: 결제 정보 생성 성공
        D -->> S: 성공
        S ->> D: 세션 만료 처리
        D -->> S: 처리 완료
        deactivate D
        S -->> U: 결제 성공 응답
        deactivate S
      else 결제 정보 생성 실패
        Note right of U: 결제 정보 생성 실패
        D -->> S: 실패
        activate S
        S ->> P: 결제 취소 요청
        activate P
        P -->> S: 결제 취소 완료
        deactivate P
        S -->> U: 예약 실패 안내
        deactivate S
      end
    else 사용자의 유효한 예약 없음
      Note over U: 사용자의 유효한 예약 없음
      S ->> P: 결제 취소 요청
      activate S
      activate P
      P -->> S: 결제 취소 완료
      deactivate P
      S -->> U: 예약 실패 안내
      deactivate S
    end
  else 지불 실패
    Note left of U: 지불 실패
    P -->> U: 결제 실패 응답
  end
```

**잔액 충전 및 조회**
```mermaid
sequenceDiagram
  actor a as User
  participant b as Server
  participant c as DB

  Note left of a: 잔액 충전
  a ->>+ b: 잔액 충전 요청 (유저 UUID, 충전 금액)
  b ->> c: 유저 정보 조회
  alt 유저 정보 존재 X
    c -->> b: 조회 실패
    b -->> a: Error - User Not Exists
  else 유저 정보 존재 O
    c -->> b: 유저 정보 반환
    b ->> c: 잔액 업데이트
    c -->> b: 업데이트 결과
    b -->>- a: 충전 완료 응답
  end

  Note left of a: 잔액 조회
  a ->> +b: 잔액 조회 요청 (사용자 ID)
  b ->> c: 사용자 잔액 조회
  alt 유저 정보 존재 X
    c -->> b: 조회 실패
    b -->> a: Error - User Not Exists
  else 유저 정보 존재 O
    c -->> b: 사용자 잔액 정보
    b -->> -a: 잔액 정보 응답
  end
```

### ERD

![erd](public/erd.png)

**schedule**
- 콘서트 스케줄 입니다.
- 현재는 하나의 콘서트에 대한 스케줄만 존재한다고 가정했습니다.

**seats**
- 좌석 정보가 저장되는 테이블입니다.
- 하나의 스케줄에 여러 개의 좌석이 존재합니다.
- 좌석 번호와 좌석의 가격을 가지고 있습니다.

**reservations**
- 예약 정보가 저장되는 테이블입니다.
- 유저가 좌석을 예약하면 5분간 유효한 예약 정보가 생성됩니다.
- 예약에 대한 결제가 완료되면 `payment_id` 가 작성되고, 해당 예약은 결제 완료 상태로 취급됩니다.
- 예약이 취소된 경우 `is_cancelled` 가 `true` 로 변경됩니다.

**payments**
- 결제 정보가 저장되는 테이블입니다.
- 예약 정보와 1:1 관계를 가집니다.

**users**
- 유저 정보가 저장되는 테이블입니다.
- `point` 는 유저의 보유 포인트 액수를 의미합니다.

**point_histories**
- 포인트 사용 및 충전 내역이 저장되는 테이블입니다.
- `type` 은 해당 기록이 포인트 충전인지 또는 사용인지를 의미합니다.

**sessions**
- 대기열 세션의 정보가 저장되는 테이블입니다.
- `wait_number` 는 대기열에서 사용자가 부여받은 대기 번호를 의미합니다.
- 사용자가 결제를 완료하거나 세션 유효시간(10분)이 초과되면 세션은 종료됩니다.
  - 세션 만료 처리는 배치 프로세스에 의해 처리됩니다.
- 세션이 시작되거나 종료될 때 session_counter 테이블의 값이 변경됩니다.

**counter**
- 대기열에 대한 정보가 저장되는 테이블입니다.
  - `created_count`: 시작된 세션 개수의 누적 값입니다. 대기 번호 발급 시에 사용됩니다.
  - `terminated_count`: 종료된 세션 개수의 누적 값입니다. 대기 번호에 대한 입장 가능 여부를 확인할 때 사용됩니다.
- 대기번호 <= (`terminated_count` + "수용 가능 세션 개수") 이면 입장 가능합니다.