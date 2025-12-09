import RecruiterProjects from '@/components/Recruiter/RecruiterProjects'
import React, { Suspense } from 'react'

const page = () => {
    return (
        <Suspense fallback={<div className="flex justify-center p-8">Loading projects...</div>}>
            <RecruiterProjects />
        </Suspense>
    )
}

export default page
